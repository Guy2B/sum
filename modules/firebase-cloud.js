const cfg = window.SIGMA_FIREBASE_CONFIG || {};
const configured = Boolean(cfg.apiKey && !String(cfg.apiKey).startsWith('REPLACE_'));
const cloud = { configured, ready:false, user:null, db:null, auth:null, api:null, syncStatus:'local' };
window.SigmaCloud = cloud;

function injectAuthUi() {
  if (document.querySelector('[data-sigma-cloud-auth]')) return;
  const style = document.createElement('style');
  style.textContent = `.sigma-cloud-auth{margin:12px;padding:12px;border:1px solid var(--border,#ddd);border-radius:14px}.sigma-cloud-auth button{width:100%;margin-top:8px}.sigma-cloud-user{display:flex;gap:10px;align-items:center}.sigma-cloud-user img{width:34px;height:34px;border-radius:50%}.sigma-cloud-status{font-size:12px;opacity:.72;margin-top:6px}.sigma-auth-dialog form{display:grid;gap:10px;min-width:min(420px,80vw)}.sigma-auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}`;
  document.head.append(style);
  const box = document.createElement('section'); box.dataset.sigmaCloudAuth=''; box.className='sigma-cloud-auth';
  const sidebar = document.getElementById('sidebar'); (sidebar || document.body).append(box);
  const dialog = document.createElement('dialog'); dialog.id='sigma-auth-dialog'; dialog.className='modal sigma-auth-dialog';
  dialog.innerHTML=`<button class="modal-close icon-button" type="button" data-auth-close>×</button><span class="eyebrow">Google Cloud</span><h2>Compte Sigma</h2><p class="muted">Connectez-vous pour synchroniser vos données entre vos appareils.</p><form><input name="email" type="email" autocomplete="email" placeholder="E-mail" required><input name="password" type="password" autocomplete="current-password" minlength="6" placeholder="Mot de passe" required><div class="sigma-auth-actions"><button class="button secondary" type="button" data-auth-signup>Créer le compte</button><button class="button primary" type="submit">Connexion</button></div><button class="button secondary full" type="button" data-auth-google>Continuer avec Google</button><small data-auth-message></small></form>`;
  document.body.append(dialog);
  dialog.querySelector('[data-auth-close]').onclick=()=>dialog.close();
  box.addEventListener('click',e=>{if(e.target.closest('[data-cloud-login]')) dialog.showModal(); if(e.target.closest('[data-cloud-logout]')) cloud.signOut?.();});
  const form=dialog.querySelector('form'), msg=dialog.querySelector('[data-auth-message]');
  form.onsubmit=async e=>{e.preventDefault();try{await cloud.signInEmail(form.email.value,form.password.value);dialog.close();}catch(err){msg.textContent=err.message;}};
  dialog.querySelector('[data-auth-signup]').onclick=async()=>{try{await cloud.signUpEmail(form.email.value,form.password.value);dialog.close();}catch(err){msg.textContent=err.message;}};
  dialog.querySelector('[data-auth-google]').onclick=async()=>{try{await cloud.signInGoogle();dialog.close();}catch(err){msg.textContent=err.message;}};
  cloud.renderAuth=()=>{if(!configured){box.innerHTML='<strong>Cloud non configuré</strong><div class="sigma-cloud-status">Complétez firebase-config.js</div>';return;} if(!cloud.user){box.innerHTML='<strong>Synchronisation cloud</strong><div class="sigma-cloud-status">Non connecté</div><button class="button secondary" data-cloud-login>Se connecter</button>';return;} const u=cloud.user; box.innerHTML=`<div class="sigma-cloud-user">${u.photoURL?`<img src="${u.photoURL}" alt="">`:''}<div><strong>${u.displayName||u.email||'Compte Sigma'}</strong><div class="sigma-cloud-status">${cloud.syncStatus==='synced'?'Synchronisé':'Connexion active'}</div></div></div><button class="button secondary" data-cloud-logout>Déconnexion</button>`;};
  cloud.renderAuth();
}

if (!configured) {
  console.warn('[SigmaCloud] Complete firebase-config.js with the Firebase Web API key.');
  document.addEventListener('DOMContentLoaded', injectAuthUi);
} else {
  const appMod = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js');
  const authMod = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js');
  const fs = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js');
  const app = appMod.initializeApp(cfg);
  cloud.auth=authMod.getAuth(app); cloud.db=fs.getFirestore(app); cloud.api={...authMod,...fs};
  cloud.signInGoogle=()=>authMod.signInWithPopup(cloud.auth,new authMod.GoogleAuthProvider());
  cloud.signInEmail=(e,p)=>authMod.signInWithEmailAndPassword(cloud.auth,e,p);
  cloud.signUpEmail=(e,p)=>authMod.createUserWithEmailAndPassword(cloud.auth,e,p);
  cloud.signOut=()=>authMod.signOut(cloud.auth);
  let saveTimer=null, applyingRemote=false;
  async function saveWorkspace(state){if(!cloud.user||applyingRemote)return; cloud.syncStatus='saving';cloud.renderAuth?.();await fs.setDoc(fs.doc(cloud.db,'workspaces',cloud.user.uid),{userId:cloud.user.uid,state,version:5,updatedAt:fs.serverTimestamp()},{merge:true});cloud.syncStatus='synced';cloud.renderAuth?.();}
  window.addEventListener('sigma:state-changed',e=>{clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveWorkspace(e.detail?.state).catch(console.error),700);});
  authMod.onAuthStateChanged(cloud.auth,async user=>{
    cloud.user=user; cloud.ready=true; injectAuthUi(); cloud.renderAuth?.();
    if(user){
      await fs.setDoc(fs.doc(cloud.db,'profiles',user.uid),{userId:user.uid,email:user.email||'',displayName:user.displayName||'',photoURL:user.photoURL||'',updatedAt:fs.serverTimestamp()},{merge:true});
      const snap=await fs.getDoc(fs.doc(cloud.db,'workspaces',user.uid));
      if(snap.exists()&&snap.data()?.state){applyingRemote=true;window.dispatchEvent(new CustomEvent('sigma:cloud-state',{detail:{state:snap.data().state}}));setTimeout(()=>{applyingRemote=false;},50);}
    }
    window.dispatchEvent(new CustomEvent('sigma:auth-changed',{detail:{user}}));
  });
}
