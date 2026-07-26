(function(g){
  function requireUser(){
    const user=window.SigmaFirebaseRuntimeAdapterV1.currentUser();
    if(!user)throw new Error('No authenticated user');
    return user;
  }
  async function setUser(data,{merge=true}={}){
    const user=requireUser(),mode=window.SigmaFirebaseRuntimeAdapterV1.mode();
    if(mode==='compat'){
      await window.SigmaFirebaseRuntimeAdapterV1.compat().db.collection('users').doc(user.uid).set(data,{merge});
      return data;
    }
    const m=window.SigmaFirebaseRuntimeAdapterV1.modular(),api=m.api;
    if(mode==='modular'&&api?.doc&&api?.setDoc){
      await api.setDoc(api.doc(m.db,'users',user.uid),data,{merge});
      return data;
    }
    throw new Error('Firestore runtime unavailable');
  }
  async function getUser(){
    const user=requireUser(),mode=window.SigmaFirebaseRuntimeAdapterV1.mode();
    if(mode==='compat'){
      const snap=await window.SigmaFirebaseRuntimeAdapterV1.compat().db.collection('users').doc(user.uid).get();
      return snap.exists?snap.data():null;
    }
    const m=window.SigmaFirebaseRuntimeAdapterV1.modular(),api=m.api;
    if(mode==='modular'&&api?.doc&&api?.getDoc){
      const snap=await api.getDoc(api.doc(m.db,'users',user.uid));
      return snap.exists()?snap.data():null;
    }
    throw new Error('Firestore runtime unavailable');
  }
  async function setSubdocument(collection,id,data,{merge=true}={}){
    const user=requireUser(),mode=window.SigmaFirebaseRuntimeAdapterV1.mode();
    if(mode==='compat'){
      await window.SigmaFirebaseRuntimeAdapterV1.compat().db.collection('users').doc(user.uid).collection(collection).doc(id).set(data,{merge});
      return data;
    }
    const m=window.SigmaFirebaseRuntimeAdapterV1.modular(),api=m.api;
    if(mode==='modular'&&api?.doc&&api?.setDoc){
      await api.setDoc(api.doc(m.db,'users',user.uid,collection,id),data,{merge});
      return data;
    }
    throw new Error('Firestore runtime unavailable');
  }
  async function getSubdocument(collection,id){
    const user=requireUser(),mode=window.SigmaFirebaseRuntimeAdapterV1.mode();
    if(mode==='compat'){
      const snap=await window.SigmaFirebaseRuntimeAdapterV1.compat().db.collection('users').doc(user.uid).collection(collection).doc(id).get();
      return snap.exists?snap.data():null;
    }
    const m=window.SigmaFirebaseRuntimeAdapterV1.modular(),api=m.api;
    if(mode==='modular'&&api?.doc&&api?.getDoc){
      const snap=await api.getDoc(api.doc(m.db,'users',user.uid,collection,id));
      return snap.exists()?snap.data():null;
    }
    throw new Error('Firestore runtime unavailable');
  }
  g.SigmaFirebaseAccountStoreV1={setUser,getUser,setSubdocument,getSubdocument};
})(window);
