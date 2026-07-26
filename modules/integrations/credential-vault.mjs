export function createCredentialVault(){
  const secrets=new Map();
  return {
    put(reference,value){
      if(!reference) throw new Error('credential reference is required');
      secrets.set(reference,structuredClone(value));
      return {reference,stored:true};
    },
    get(reference){
      if(!secrets.has(reference)) return null;
      return structuredClone(secrets.get(reference));
    },
    remove(reference){return secrets.delete(reference);},
    listReferences(){return [...secrets.keys()];}
  };
}
