(function(g){
  function generate(action,operation){
    const source=action.source||{};
    const name=action.author||source.author||'';
    const subject=source.title||action.title||'';
    if(operation==='Répondre'){
      return {
        subject:subject.startsWith('Re:')?subject:`Re: ${subject}`,
        body:`Bonjour${name?` ${name}`:''},\n\nMerci pour votre message. Je reviens vers vous concernant « ${subject} ».\n\nCordialement,`
      };
    }
    if(operation==='Contacter'){
      return {
        subject:`À propos de ${subject}`,
        body:`Bonjour${name?` ${name}`:''},\n\nJe vous contacte au sujet de « ${subject} ».\n\nCordialement,`
      };
    }
    return {subject:'',body:''};
  }
  g.SigmaDraftGenerator={generate};
})(window);
