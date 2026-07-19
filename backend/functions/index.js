const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {onRequest}=require('firebase-functions/v2/https');
const {setGlobalOptions}=require('firebase-functions/v2');
const {defineSecret,defineString}=require('firebase-functions/params');
const admin=require('firebase-admin');
const crypto=require('crypto');

admin.initializeApp();
setGlobalOptions({region:'europe-west1',maxInstances:10});
const db=admin.firestore();

const META_APP_SECRET=defineSecret('META_APP_SECRET');
const META_WEBHOOK_VERIFY_TOKEN=defineSecret('META_WEBHOOK_VERIFY_TOKEN');
const META_APP_ID=defineString('META_APP_ID',{default:''});
const META_REDIRECT_URI=defineString('META_REDIRECT_URI',{default:''});
const META_PUBLIC_APP_URL=defineString('META_PUBLIC_APP_URL',{default:'https://guy2b.github.io/sum/app.html'});
const META_GRAPH_VERSION=defineString('META_GRAPH_VERSION',{default:'v23.0'});

function requireAuth(req){if(!req.auth) throw new HttpsError('unauthenticated','Authentication required');return req.auth.uid;}
function metaConfig(){const appId=META_APP_ID.value();const redirectUri=META_REDIRECT_URI.value();if(!appId||!redirectUri) throw new HttpsError('failed-precondition','Meta OAuth environment is incomplete');return {appId,redirectUri,version:META_GRAPH_VERSION.value()};}
async function graph(path,token,params={}){const q=new URLSearchParams(params);if(token)q.set('access_token',token);const url=`https://graph.facebook.com/${META_GRAPH_VERSION.value()}${path}?${q}`;const r=await fetch(url);const body=await r.json().catch(()=>({}));if(!r.ok||body.error)throw new Error(body.error?.message||`Meta Graph ${r.status}`);return body;}
function safeReturnUrl(value){try{const url=new URL(String(value||META_PUBLIC_APP_URL.value()));if(!['https:','http:'].includes(url.protocol))throw new Error();return url.toString();}catch{return META_PUBLIC_APP_URL.value();}}

exports.healthImport=onCall(async req=>{const uid=requireAuth(req);const rows=Array.isArray(req.data?.metrics)?req.data.metrics:[];if(rows.length>500)throw new HttpsError('invalid-argument','Maximum 500 metrics');const batch=db.batch();rows.forEach(row=>batch.set(db.collection('healthMetrics').doc(),{...row,userId:uid,createdAt:admin.firestore.FieldValue.serverTimestamp()}));await batch.commit();return{imported:rows.length};});
exports.setBetaPremium=onCall(async req=>{const uid=requireAuth(req);await db.doc(`premiumEntitlements/${uid}`).set({userId:uid,plan:'beta-premium',active:true,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});return{active:true,plan:'beta-premium'};});
exports.betaFeedback=onCall(async req=>{const uid=requireAuth(req);const text=String(req.data?.text||'').trim();if(!text)throw new HttpsError('invalid-argument','Feedback is empty');await db.collection('betaFeedback').add({userId:uid,text,createdAt:admin.firestore.FieldValue.serverTimestamp()});return{saved:true};});

exports.metaCreateOAuthSession=onCall(async req=>{
  const uid=requireAuth(req);const {appId,redirectUri,version}=metaConfig();
  const state=crypto.randomBytes(32).toString('hex');
  await db.doc(`socialOAuthStates/${state}`).set({uid,provider:'meta',returnUrl:safeReturnUrl(req.data?.returnUrl),createdAt:admin.firestore.FieldValue.serverTimestamp(),expiresAt:admin.firestore.Timestamp.fromMillis(Date.now()+10*60*1000)});
  const scope=['pages_show_list','pages_read_engagement','pages_manage_metadata','instagram_basic','instagram_manage_comments','business_management'].join(',');
  const q=new URLSearchParams({client_id:appId,redirect_uri:redirectUri,state,response_type:'code',scope});
  return{authUrl:`https://www.facebook.com/${version}/dialog/oauth?${q}`};
});

exports.metaOAuthCallback=onRequest({secrets:[META_APP_SECRET]},async(req,res)=>{
  const returnWith=(base,status,message='')=>{const u=new URL(base||META_PUBLIC_APP_URL.value());u.searchParams.set('sigmaMeta',status);if(message)u.searchParams.set('message',message.slice(0,180));res.redirect(u.toString());};
  try{
    const state=String(req.query.state||''),code=String(req.query.code||'');if(!state||!code)throw new Error('Missing OAuth state or code');
    const ref=db.doc(`socialOAuthStates/${state}`),snap=await ref.get();if(!snap.exists)throw new Error('OAuth session expired');
    const session=snap.data();if(session.expiresAt?.toMillis()<Date.now())throw new Error('OAuth session expired');
    const {appId,redirectUri}=metaConfig();
    const tokenUrl=new URL(`https://graph.facebook.com/${META_GRAPH_VERSION.value()}/oauth/access_token`);tokenUrl.search=new URLSearchParams({client_id:appId,client_secret:META_APP_SECRET.value(),redirect_uri:redirectUri,code}).toString();
    const tokenResponse=await fetch(tokenUrl);const tokenBody=await tokenResponse.json();if(!tokenResponse.ok||!tokenBody.access_token)throw new Error(tokenBody.error?.message||'Meta token exchange failed');
    const longUrl=new URL(`https://graph.facebook.com/${META_GRAPH_VERSION.value()}/oauth/access_token`);longUrl.search=new URLSearchParams({grant_type:'fb_exchange_token',client_id:appId,client_secret:META_APP_SECRET.value(),fb_exchange_token:tokenBody.access_token}).toString();
    const longResponse=await fetch(longUrl);const longBody=await longResponse.json();const userToken=longBody.access_token||tokenBody.access_token;
    const pages=await graph('/me/accounts',userToken,{fields:'id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url}'});
    const accountRows=[];const pageTokens={};
    for(const page of pages.data||[]){pageTokens[page.id]=page.access_token;accountRows.push({id:page.id,kind:'facebook',name:page.name||'Facebook Page',category:page.category||''});if(page.instagram_business_account)accountRows.push({id:page.instagram_business_account.id,kind:'instagram',name:page.instagram_business_account.name||page.instagram_business_account.username||'Instagram',username:page.instagram_business_account.username||'',pageId:page.id});}
    await db.doc(`socialPrivateTokens/${session.uid}/providers/meta`).set({provider:'meta',userToken,pageTokens,accounts:accountRows,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    await db.doc(`users/${session.uid}/socialProviders/meta`).set({provider:'meta',connected:true,accounts:accountRows,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    await ref.delete();returnWith(session.returnUrl,'connected');
  }catch(error){console.error('metaOAuthCallback',error);returnWith(META_PUBLIC_APP_URL.value(),'error',error.message);}
});

exports.metaStatus=onCall(async req=>{const uid=requireAuth(req);const snap=await db.doc(`users/${uid}/socialProviders/meta`).get();return snap.exists?snap.data():{provider:'meta',connected:false,accounts:[]};});

exports.metaSync=onCall({secrets:[META_APP_SECRET]},async req=>{
  const uid=requireAuth(req);const tokenSnap=await db.doc(`socialPrivateTokens/${uid}/providers/meta`).get();if(!tokenSnap.exists)throw new HttpsError('failed-precondition','Meta is not connected');
  const secret=tokenSnap.data(),accounts=secret.accounts||[],posts=[],comments=[];
  for(const account of accounts){
    try{
      if(account.kind==='facebook'){
        const token=secret.pageTokens?.[account.id]||secret.userToken;
        const feed=await graph(`/${account.id}/feed`,token,{fields:'id,message,created_time,permalink_url,comments.limit(25){id,message,from,created_time}',limit:'25'});
        for(const item of feed.data||[]){posts.push({id:item.id,provider:'facebook',accountId:account.id,text:item.message||'',createdAt:item.created_time||'',url:item.permalink_url||''});for(const c of item.comments?.data||[])comments.push({id:c.id,provider:'facebook',accountId:account.id,postId:item.id,text:c.message||'',author:c.from?.name||'',createdAt:c.created_time||'',url:item.permalink_url||''});}
      } else if(account.kind==='instagram'){
        const media=await graph(`/${account.id}/media`,secret.userToken,{fields:'id,caption,media_type,timestamp,permalink,comments.limit(25){id,text,username,timestamp}',limit:'25'});
        for(const item of media.data||[]){posts.push({id:item.id,provider:'instagram',accountId:account.id,text:item.caption||'',createdAt:item.timestamp||'',url:item.permalink||'',mediaType:item.media_type||''});for(const c of item.comments?.data||[])comments.push({id:c.id,provider:'instagram',accountId:account.id,postId:item.id,text:c.text||'',author:c.username||'',createdAt:c.timestamp||'',url:item.permalink||''});}
      }
    }catch(error){console.warn('Meta account sync skipped',account.id,error.message);}
  }
  await db.doc(`users/${uid}/socialSync/meta`).set({provider:'meta',accountCount:accounts.length,postCount:posts.length,commentCount:comments.length,lastSyncAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
  return{accounts,posts,comments,syncedAt:new Date().toISOString()};
});

exports.metaDisconnect=onCall(async req=>{const uid=requireAuth(req);await Promise.all([db.doc(`socialPrivateTokens/${uid}/providers/meta`).delete(),db.doc(`users/${uid}/socialProviders/meta`).delete(),db.doc(`users/${uid}/socialSync/meta`).delete()]);return{disconnected:true};});

exports.metaWebhook=onRequest({secrets:[META_WEBHOOK_VERIFY_TOKEN]},async(req,res)=>{
  if(req.method==='GET'){
    const mode=req.query['hub.mode'],token=req.query['hub.verify_token'],challenge=req.query['hub.challenge'];
    if(mode==='subscribe'&&token===META_WEBHOOK_VERIFY_TOKEN.value())return res.status(200).send(challenge);
    return res.sendStatus(403);
  }
  if(req.method==='POST'){
    await db.collection('socialWebhookEvents').add({provider:'meta',body:req.body||{},receivedAt:admin.firestore.FieldValue.serverTimestamp()});
    return res.sendStatus(200);
  }
  return res.sendStatus(405);
});
