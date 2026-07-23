const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {onRequest}=require('firebase-functions/v2/https');
const {setGlobalOptions}=require('firebase-functions/v2');
const {defineSecret,defineString}=require('firebase-functions/params');
const admin=require('firebase-admin');
const crypto=require('crypto');

admin.initializeApp();
setGlobalOptions({region:'europe-west1',maxInstances:10});
const db=admin.firestore();

const SOCIAL_PUBLIC_APP_URL=defineString('SOCIAL_PUBLIC_APP_URL',{default:'https://guy2b.github.io/sum/app.html'});

function requireAuth(req){if(!req.auth) throw new HttpsError('unauthenticated','Authentication required');return req.auth.uid;}
function safeReturnUrl(value){try{const url=new URL(String(value||SOCIAL_PUBLIC_APP_URL.value()));if(!['https:','http:'].includes(url.protocol))throw new Error();return url.toString();}catch{return SOCIAL_PUBLIC_APP_URL.value();}}

exports.healthImport=onCall(async req=>{const uid=requireAuth(req);const rows=Array.isArray(req.data?.metrics)?req.data.metrics:[];if(rows.length>500)throw new HttpsError('invalid-argument','Maximum 500 metrics');const batch=db.batch();rows.forEach(row=>batch.set(db.collection('healthMetrics').doc(),{...row,userId:uid,createdAt:admin.firestore.FieldValue.serverTimestamp()}));await batch.commit();return{imported:rows.length};});
exports.setBetaPremium=onCall(async req=>{const uid=requireAuth(req);await db.doc(`premiumEntitlements/${uid}`).set({userId:uid,plan:'beta-premium',active:true,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});return{active:true,plan:'beta-premium'};});
exports.betaFeedback=onCall(async req=>{const uid=requireAuth(req);const text=String(req.data?.text||'').trim();if(!text)throw new HttpsError('invalid-argument','Feedback is empty');await db.collection('betaFeedback').add({userId:uid,text,createdAt:admin.firestore.FieldValue.serverTimestamp()});return{saved:true};});

// Meta/Facebook/Instagram integration intentionally disabled.
// Restore from Git history only if official API access becomes available.

// Sigma V4.9.3 — LinkedIn OAuth and profile synchronisation.
const LINKEDIN_CLIENT_SECRET=defineSecret('LINKEDIN_CLIENT_SECRET');
const LINKEDIN_CLIENT_ID=defineString('LINKEDIN_CLIENT_ID',{default:''});
const LINKEDIN_REDIRECT_URI=defineString('LINKEDIN_REDIRECT_URI',{default:''});
function linkedinConfig(){const clientId=LINKEDIN_CLIENT_ID.value(),redirectUri=LINKEDIN_REDIRECT_URI.value();if(!clientId||!redirectUri)throw new HttpsError('failed-precondition','LinkedIn OAuth environment is incomplete');return{clientId,redirectUri};}
exports.linkedinCreateOAuthSession=onCall(async req=>{const uid=requireAuth(req),{clientId,redirectUri}=linkedinConfig(),state=crypto.randomBytes(32).toString('hex');await db.doc(`socialOAuthStates/${state}`).set({uid,provider:'linkedin',returnUrl:safeReturnUrl(req.data?.returnUrl),createdAt:admin.firestore.FieldValue.serverTimestamp(),expiresAt:admin.firestore.Timestamp.fromMillis(Date.now()+10*60*1000)});const q=new URLSearchParams({response_type:'code',client_id:clientId,redirect_uri:redirectUri,state,scope:'openid profile email'});return{authUrl:`https://www.linkedin.com/oauth/v2/authorization?${q}`};});
exports.linkedinOAuthCallback=onRequest({secrets:[LINKEDIN_CLIENT_SECRET]},async(req,res)=>{const back=(base,status,message='')=>{const u=new URL(base||SOCIAL_PUBLIC_APP_URL.value());u.searchParams.set('sigmaLinkedIn',status);if(message)u.searchParams.set('message',message.slice(0,180));res.redirect(u.toString());};try{const state=String(req.query.state||''),code=String(req.query.code||'');if(!state||!code)throw new Error('Missing OAuth state or code');const ref=db.doc(`socialOAuthStates/${state}`),snap=await ref.get();if(!snap.exists)throw new Error('OAuth session expired');const session=snap.data();const {clientId,redirectUri}=linkedinConfig();const token=await fetch('https://www.linkedin.com/oauth/v2/accessToken',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code,client_id:clientId,client_secret:LINKEDIN_CLIENT_SECRET.value(),redirect_uri:redirectUri})});const body=await token.json();if(!token.ok||!body.access_token)throw new Error(body.error_description||'LinkedIn token exchange failed');await db.doc(`socialPrivateTokens/${session.uid}/providers/linkedin`).set({provider:'linkedin',accessToken:body.access_token,expiresIn:body.expires_in||0,updatedAt:admin.firestore.FieldValue.serverTimestamp()});await db.doc(`users/${session.uid}/socialProviders/linkedin`).set({provider:'linkedin',connected:true,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});await ref.delete();back(session.returnUrl,'connected');}catch(error){console.error('linkedinOAuthCallback',error);back(SOCIAL_PUBLIC_APP_URL.value(),'error',error.message);}});
exports.linkedinStatus=onCall(async req=>{const uid=requireAuth(req),snap=await db.doc(`users/${uid}/socialProviders/linkedin`).get();return snap.exists?snap.data():{provider:'linkedin',connected:false};});
exports.linkedinSync=onCall({secrets:[LINKEDIN_CLIENT_SECRET]},async req=>{const uid=requireAuth(req),snap=await db.doc(`socialPrivateTokens/${uid}/providers/linkedin`).get();if(!snap.exists)throw new HttpsError('failed-precondition','LinkedIn is not connected');const token=snap.data().accessToken;const profileResponse=await fetch('https://api.linkedin.com/v2/userinfo',{headers:{authorization:`Bearer ${token}`}});const profile=await profileResponse.json();if(!profileResponse.ok)throw new HttpsError('internal',profile.message||'LinkedIn profile request failed');const account={id:profile.sub,externalId:profile.sub,provider:'linkedin',displayName:profile.name||'LinkedIn',title:profile.name||'LinkedIn',avatar:profile.picture||'',connected:true,permissions:['openid','profile','email']};return{accounts:[account],posts:[],messages:[],comments:[],metrics:[],notifications:[],syncedAt:new Date().toISOString()};});
exports.linkedinDisconnect=onCall(async req=>{const uid=requireAuth(req);await Promise.all([db.doc(`socialPrivateTokens/${uid}/providers/linkedin`).delete(),db.doc(`users/${uid}/socialProviders/linkedin`).delete()]);return{disconnected:true};});

// Sigma V4.9.4 — X OAuth 2.0 PKCE.
const X_CLIENT_SECRET=defineSecret('X_CLIENT_SECRET');
const X_CLIENT_ID=defineString('X_CLIENT_ID',{default:''});
const X_REDIRECT_URI=defineString('X_REDIRECT_URI',{default:''});
function xConfig(){const clientId=X_CLIENT_ID.value(),redirectUri=X_REDIRECT_URI.value();if(!clientId||!redirectUri)throw new HttpsError('failed-precondition','X OAuth environment is incomplete');return{clientId,redirectUri};}
function base64url(buffer){return Buffer.from(buffer).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
exports.xCreateOAuthSession=onCall(async req=>{const uid=requireAuth(req),{clientId,redirectUri}=xConfig(),state=crypto.randomBytes(32).toString('hex'),verifier=base64url(crypto.randomBytes(48)),challenge=base64url(crypto.createHash('sha256').update(verifier).digest());await db.doc(`socialOAuthStates/${state}`).set({uid,provider:'x',verifier,returnUrl:safeReturnUrl(req.data?.returnUrl),expiresAt:admin.firestore.Timestamp.fromMillis(Date.now()+10*60*1000)});const q=new URLSearchParams({response_type:'code',client_id:clientId,redirect_uri:redirectUri,scope:'tweet.read users.read offline.access',state,code_challenge:challenge,code_challenge_method:'S256'});return{authUrl:`https://x.com/i/oauth2/authorize?${q}`};});
exports.xOAuthCallback=onRequest({secrets:[X_CLIENT_SECRET]},async(req,res)=>{const back=(base,status,message='')=>{const u=new URL(base||SOCIAL_PUBLIC_APP_URL.value());u.searchParams.set('sigmaX',status);if(message)u.searchParams.set('message',message.slice(0,180));res.redirect(u.toString());};try{const state=String(req.query.state||''),code=String(req.query.code||''),ref=db.doc(`socialOAuthStates/${state}`),snap=await ref.get();if(!snap.exists||!code)throw new Error('OAuth session expired');const session=snap.data(),{clientId,redirectUri}=xConfig();const auth=Buffer.from(`${clientId}:${X_CLIENT_SECRET.value()}`).toString('base64');const r=await fetch('https://api.x.com/2/oauth2/token',{method:'POST',headers:{authorization:`Basic ${auth}`,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,grant_type:'authorization_code',redirect_uri:redirectUri,code_verifier:session.verifier})});const body=await r.json();if(!r.ok||!body.access_token)throw new Error(body.error_description||'X token exchange failed');await db.doc(`socialPrivateTokens/${session.uid}/providers/x`).set({provider:'x',...body,updatedAt:admin.firestore.FieldValue.serverTimestamp()});await db.doc(`users/${session.uid}/socialProviders/x`).set({provider:'x',connected:true,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});await ref.delete();back(session.returnUrl,'connected');}catch(e){console.error('xOAuthCallback',e);back(SOCIAL_PUBLIC_APP_URL.value(),'error',e.message);}});
exports.xStatus=onCall(async req=>{const uid=requireAuth(req),snap=await db.doc(`users/${uid}/socialProviders/x`).get();return snap.exists?snap.data():{provider:'x',connected:false};});
exports.xSync=onCall({secrets:[X_CLIENT_SECRET]},async req=>{
  const uid=requireAuth(req);
  const tokenRef=db.doc(`socialPrivateTokens/${uid}/providers/x`);
  const snap=await tokenRef.get();

  if(!snap.exists){
    throw new HttpsError(
      'failed-precondition',
      'X is not connected. Disconnect and reconnect your X account.'
    );
  }

  const storedTokens=snap.data()||{};

  async function fetchCurrentUser(accessToken){
    const response=await fetch(
      'https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url,public_metrics',
      {headers:{authorization:`Bearer ${accessToken}`}}
    );
    const body=await response.json().catch(()=>({}));

    console.log('xSync users/me response',{
      uid,
      status:response.status,
      ok:response.ok,
      errorCode:body.errors?.[0]?.code||body.error||'',
      errorTitle:body.title||'',
      errorDetail:body.detail||body.errors?.[0]?.message||''
    });

    return{response,body};
  }

  async function refreshAccessToken(refreshToken){
    const {clientId}=xConfig();
    const auth=Buffer.from(`${clientId}:${X_CLIENT_SECRET.value()}`).toString('base64');

    const response=await fetch('https://api.x.com/2/oauth2/token',{
      method:'POST',
      headers:{
        authorization:`Basic ${auth}`,
        'content-type':'application/x-www-form-urlencoded'
      },
      body:new URLSearchParams({
        grant_type:'refresh_token',
        refresh_token:refreshToken,
        client_id:clientId
      })
    });
    const body=await response.json().catch(()=>({}));

    console.log('xSync token refresh response',{
      uid,
      status:response.status,
      ok:response.ok,
      error:body.error||'',
      errorDescription:body.error_description||''
    });

    if(!response.ok||!body.access_token){
      throw new HttpsError(
        'failed-precondition',
        'X authorization has expired. Disconnect and reconnect your X account.'
      );
    }

    await tokenRef.set({
      provider:'x',
      access_token:body.access_token,
      refresh_token:body.refresh_token||refreshToken,
      token_type:body.token_type||storedTokens.token_type||'bearer',
      expires_in:body.expires_in||storedTokens.expires_in||0,
      scope:body.scope||storedTokens.scope||'',
      refreshedAt:admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:admin.firestore.FieldValue.serverTimestamp()
    },{merge:true});

    return body.access_token;
  }

  let accessToken=storedTokens.access_token;

  if(!accessToken){
    throw new HttpsError(
      'failed-precondition',
      'X access token is missing. Disconnect and reconnect your X account.'
    );
  }

  let result=await fetchCurrentUser(accessToken);

  if(result.response.status===401&&storedTokens.refresh_token){
    accessToken=await refreshAccessToken(storedTokens.refresh_token);
    result=await fetchCurrentUser(accessToken);
  }

  const {response,body}=result;

  if(!response.ok){
    const detail=
      body.detail||
      body.title||
      body.errors?.[0]?.message||
      'X profile request failed';

    if(response.status===401){
      throw new HttpsError(
        'failed-precondition',
        'X authorization has expired. Disconnect and reconnect your X account.'
      );
    }

    if(response.status===403){
      throw new HttpsError(
        'permission-denied',
        `X denied access to the profile: ${detail}`
      );
    }

    if(response.status===429){
      throw new HttpsError(
        'resource-exhausted',
        'X API rate limit reached. Try again later.'
      );
    }

    console.error('xSync X API failure',{
      uid,
      status:response.status,
      detail
    });

    throw new HttpsError(
      'internal',
      `X API error ${response.status}: ${detail}`
    );
  }

  const user=body.data||{};

  if(!user.id){
    console.error('xSync incomplete X profile response',{uid});
    throw new HttpsError(
      'data-loss',
      'X returned an incomplete profile response.'
    );
  }

  const account={
    id:user.id,
    externalId:user.id,
    provider:'x',
    displayName:user.name||user.username||'X',
    title:user.name||user.username||'X',
    username:user.username||'',
    avatar:user.profile_image_url||'',
    connected:true
  };

  await db.doc(`users/${uid}/socialProviders/x`).set({
    provider:'x',
    connected:true,
    accounts:[account],
    displayName:account.displayName,
    avatar:account.avatar,
    permissions:['tweet.read','users.read','offline.access'],
    updatedAt:admin.firestore.FieldValue.serverTimestamp()
  },{merge:true});

  return{
    accounts:[account],
    metrics:Object.entries(user.public_metrics||{}).map(([name,value])=>({
      id:`x_${user.id}_${name}`,
      externalId:`${user.id}_${name}`,
      provider:'x',
      name,
      title:name,
      value,
      period:'current'
    })),
    posts:[],
    messages:[],
    comments:[],
    notifications:[],
    syncedAt:new Date().toISOString()
  };
});
exports.xDisconnect=onCall(async req=>{const uid=requireAuth(req);await Promise.all([db.doc(`socialPrivateTokens/${uid}/providers/x`).delete(),db.doc(`users/${uid}/socialProviders/x`).delete()]);return{disconnected:true};});

// Sigma V4.10.2 — TikTok Login Kit + connected-state return fix.
const TIKTOK_CLIENT_SECRET=defineSecret('TIKTOK_CLIENT_SECRET');
const TIKTOK_CLIENT_KEY=defineString('TIKTOK_CLIENT_KEY',{default:''});
const TIKTOK_REDIRECT_URI=defineString('TIKTOK_REDIRECT_URI',{default:''});
const TIKTOK_PUBLIC_APP_URL=defineString('TIKTOK_PUBLIC_APP_URL',{default:'https://guy2b.github.io/sum/app.html'});

function tiktokConfig(){
  const clientKey=TIKTOK_CLIENT_KEY.value();
  const redirectUri=TIKTOK_REDIRECT_URI.value();
  if(!clientKey||!redirectUri){
    throw new HttpsError('failed-precondition','TikTok OAuth environment is incomplete');
  }
  return{clientKey,redirectUri};
}

function tiktokAppReturnUrl(value){
  const fallback=TIKTOK_PUBLIC_APP_URL.value()||'https://guy2b.github.io/sum/app.html';
  try{
    const url=new URL(String(value||fallback));

    // The public landing page does not restore the Social Hub.
    // Redirect OAuth returns to the authenticated application page instead.
    if(
      url.origin==='https://guy2b.github.io' &&
      (url.pathname==='/sum/'||url.pathname==='/sum'||url.pathname==='/')
    ){
      url.pathname='/sum/app.html';
    }

    url.hash='social';
    return url.toString();
  }catch{
    return `${fallback}#social`;
  }
}

async function fetchTikTokBasicProfile(accessToken){
  const fields='open_id,union_id,avatar_url,display_name';
  const response=await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=${encodeURIComponent(fields)}`,
    {headers:{authorization:`Bearer ${accessToken}`}}
  );
  const body=await response.json().catch(()=>({}));

  const apiCode=String(body.error?.code||'').toLowerCase();
  if(!response.ok||(apiCode&&apiCode!=='ok')){
    console.error('TikTok user info error',JSON.stringify(body));
    throw new Error(body.error?.message||'TikTok profile request failed');
  }

  const user=body.data?.user||{};
  if(!user.open_id){
    throw new Error('TikTok profile response is incomplete');
  }

  return{
    id:user.open_id,
    externalId:user.open_id,
    unionId:user.union_id||'',
    provider:'tiktok',
    displayName:user.display_name||'TikTok',
    title:user.display_name||'TikTok',
    avatar:user.avatar_url||'',
    connected:true,
    permissions:['user.info.basic']
  };
}

exports.tiktokCreateOAuthSession=onCall(async req=>{
  const uid=requireAuth(req);
  const {clientKey,redirectUri}=tiktokConfig();
  const state=crypto.randomBytes(32).toString('hex');

  await db.doc(`socialOAuthStates/${state}`).set({
    uid,
    provider:'tiktok',
    returnUrl:tiktokAppReturnUrl(req.data?.returnUrl),
    createdAt:admin.firestore.FieldValue.serverTimestamp(),
    expiresAt:admin.firestore.Timestamp.fromMillis(Date.now()+10*60*1000)
  });

  const q=new URLSearchParams({
    client_key:clientKey,
    response_type:'code',
    scope:'user.info.basic',
    redirect_uri:redirectUri,
    state
  });

  return{authUrl:`https://www.tiktok.com/v2/auth/authorize/?${q}`};
});

exports.tiktokOAuthCallback=onRequest({secrets:[TIKTOK_CLIENT_SECRET]},async(req,res)=>{
  let returnUrl=tiktokAppReturnUrl();

  const back=(status,message='')=>{
    const url=new URL(returnUrl);
    url.searchParams.set('sigmaTikTok',status);
    url.searchParams.set('provider','tiktok');

    if(status==='connected'){
      url.searchParams.set('connected','1');
    }
    if(message){
      url.searchParams.set('message',String(message).slice(0,180));
    }

    url.hash='social';
    return res.redirect(url.toString());
  };

  try{
    const state=String(req.query.state||'');
    const code=String(req.query.code||'');
    const oauthError=String(req.query.error_description||req.query.error||'');

    if(oauthError){
      throw new Error(oauthError);
    }
    if(!state||!code){
      throw new Error('Missing OAuth state or code');
    }

    const ref=db.doc(`socialOAuthStates/${state}`);
    const snap=await ref.get();

    if(!snap.exists){
      throw new Error('OAuth session expired');
    }

    const session=snap.data();
    returnUrl=tiktokAppReturnUrl(session.returnUrl);

    if(session.provider!=='tiktok'){
      throw new Error('Invalid OAuth provider');
    }
    if(session.expiresAt?.toMillis&&session.expiresAt.toMillis()<Date.now()){
      await ref.delete();
      throw new Error('OAuth session expired');
    }

    const {clientKey,redirectUri}=tiktokConfig();
    const tokenResponse=await fetch('https://open.tiktokapis.com/v2/oauth/token/',{
      method:'POST',
      headers:{'content-type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({
        client_key:clientKey,
        client_secret:TIKTOK_CLIENT_SECRET.value(),
        code,
        grant_type:'authorization_code',
        redirect_uri:redirectUri
      })
    });

    const tokenBody=await tokenResponse.json().catch(()=>({}));
    if(!tokenResponse.ok||!tokenBody.access_token){
      throw new Error(
        tokenBody.error_description||
        tokenBody.error?.message||
        'TikTok token exchange failed'
      );
    }

    // Save the token first. A temporary profile API failure must not cancel a
    // successful OAuth connection.
    await db.doc(`socialPrivateTokens/${session.uid}/providers/tiktok`).set({
      provider:'tiktok',
      ...tokenBody,
      updatedAt:admin.firestore.FieldValue.serverTimestamp()
    });

    let account={
      id:tokenBody.open_id||'tiktok',
      externalId:tokenBody.open_id||'tiktok',
      provider:'tiktok',
      displayName:'TikTok',
      title:'TikTok',
      avatar:'',
      connected:true,
      permissions:['user.info.basic']
    };
    try{
      account=await fetchTikTokBasicProfile(tokenBody.access_token);
    }catch(profileError){
      console.warn('TikTok profile fetch deferred',profileError.message);
    }

    await db.doc(`users/${session.uid}/socialProviders/tiktok`).set({
      provider:'tiktok',
      connected:true,
      accounts:[account],
      displayName:account.displayName,
      avatar:account.avatar,
      permissions:['user.info.basic'],
      updatedAt:admin.firestore.FieldValue.serverTimestamp()
    },{merge:true});

    await ref.delete();
    return back('connected');
  }catch(error){
    console.error('tiktokOAuthCallback',error);
    return back('error',error.message);
  }
});

exports.tiktokStatus=onCall(async req=>{
  const uid=requireAuth(req);
  const snap=await db.doc(`users/${uid}/socialProviders/tiktok`).get();
  return snap.exists
    ? snap.data()
    : {provider:'tiktok',connected:false,accounts:[]};
});

exports.tiktokSync=onCall({secrets:[TIKTOK_CLIENT_SECRET]},async req=>{
  const uid=requireAuth(req);
  const tokenSnap=await db.doc(`socialPrivateTokens/${uid}/providers/tiktok`).get();

  if(!tokenSnap.exists){
    throw new HttpsError('failed-precondition','TikTok is not connected');
  }

  try{
    const account=await fetchTikTokBasicProfile(tokenSnap.data().access_token);

    await db.doc(`users/${uid}/socialProviders/tiktok`).set({
      provider:'tiktok',
      connected:true,
      accounts:[account],
      displayName:account.displayName,
      avatar:account.avatar,
      permissions:['user.info.basic'],
      updatedAt:admin.firestore.FieldValue.serverTimestamp()
    },{merge:true});

    return{
      accounts:[account],
      metrics:[],
      posts:[],
      messages:[],
      comments:[],
      notifications:[],
      syncedAt:new Date().toISOString()
    };
  }catch(error){
    console.error('tiktokSync',error);
    throw new HttpsError('internal',error.message||'TikTok profile request failed');
  }
});

exports.tiktokDisconnect=onCall(async req=>{
  const uid=requireAuth(req);
  await Promise.all([
    db.doc(`socialPrivateTokens/${uid}/providers/tiktok`).delete(),
    db.doc(`users/${uid}/socialProviders/tiktok`).delete(),
    db.doc(`users/${uid}/socialSync/tiktok`).delete()
  ]);
  return{disconnected:true};
});


// Sigma Intelligence Engine V1 — phases 3–5. Server-authoritative persistence,
// human approval workflow and audit history. No external side effect is executed.
const intelligenceHandlers=require('./src/intelligence/action-engine').createHandlers({onCall,HttpsError,admin,db});
Object.assign(exports,intelligenceHandlers);

// Sigma Intelligence — Sprints 5.4–5.6: Today projection, observed memory,
// and controlled action artifacts. No message, publication or calendar write.
Object.assign(exports,require('./src/intelligence/today-engine').createHandlers({onCall,HttpsError,admin,db}));
Object.assign(exports,require('./src/intelligence/memory-engine').createHandlers({onCall,HttpsError,admin,db}));
