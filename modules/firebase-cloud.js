const cfg = window.SIGMA_FIREBASE_CONFIG || {};
const configured = cfg.apiKey && !String(cfg.apiKey).startsWith('REPLACE_');
const state = { configured, ready:false, user:null, db:null, auth:null, storage:null, functions:null };
window.SigmaCloud = state;
if (!configured) {
  console.warn('[SigmaCloud] Firebase is not configured. Complete firebase-config.js.');
} else {
  const appMod = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js');
  const authMod = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js');
  const fsMod = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js');
  const storageMod = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js');
  const fnMod = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js');
  const app = appMod.initializeApp(cfg);
  state.auth = authMod.getAuth(app); state.db = fsMod.getFirestore(app);
  state.storage = storageMod.getStorage(app); state.functions = fnMod.getFunctions(app, cfg.functionsRegion || 'europe-west1');
  state.api = { ...authMod, ...fsMod, ...storageMod, ...fnMod };
  authMod.onAuthStateChanged(state.auth, async user => {
    state.user=user; state.ready=true;
    if (user) {
      const ref=fsMod.doc(state.db,'profiles',user.uid);
      await fsMod.setDoc(ref,{email:user.email||'',displayName:user.displayName||'',updatedAt:fsMod.serverTimestamp()},{merge:true});
    }
    window.dispatchEvent(new CustomEvent('sigma:auth-changed',{detail:{user}}));
  });
  state.signInGoogle=()=>authMod.signInWithPopup(state.auth,new authMod.GoogleAuthProvider());
  state.signInEmail=(email,password)=>authMod.signInWithEmailAndPassword(state.auth,email,password);
  state.signUpEmail=(email,password)=>authMod.createUserWithEmailAndPassword(state.auth,email,password);
  state.signOut=()=>authMod.signOut(state.auth);
  state.saveUserDoc=(collection,id,data)=>{if(!state.user) throw new Error('Authentication required'); return fsMod.setDoc(fsMod.doc(state.db,collection,id),{...data,userId:state.user.uid,updatedAt:fsMod.serverTimestamp()},{merge:true});};
}
