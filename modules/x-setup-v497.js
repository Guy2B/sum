'use strict';
(() => {
  const cfg=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.x||{};
  function statusText(){const c=cfg();if(!c.enabled)return'Désactivé';if(!c.configured||!c.clientId||String(c.clientId).startsWith('REPLACE_'))return'Client ID X requis';return'Prêt à connecter';}
  async function act(){try{if(!window.SigmaX?.isConfigured?.())throw new Error('Ajoutez le X Client ID dans social-config.js, configurez le callback et déployez les fonctions X.');await window.SigmaX.connect();}catch(e){alert(e.message);}}
  function render(){
    const card=[...document.querySelectorAll('.v490-provider-card')].find(x=>/^\s*X\b/m.test(x.textContent||''));
    if(card&&!card.querySelector('[data-x-connect]')){const b=document.createElement('button');b.type='button';b.className='button secondary small';b.dataset.xConnect='1';b.textContent='Connecter X';b.addEventListener('click',act);card.appendChild(b);}
    const picker=document.querySelector('[data-social-provider="x"]');if(picker)picker.title=statusText();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',render,{once:true}):render();
  window.addEventListener('sigma:social-provider-registered',render);
  window.SigmaXSetup=Object.freeze({version:'4.9.7',status:statusText,connect:act});
})();
