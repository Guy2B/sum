'use strict';
(() => {
  const cfg=()=>window.SIGMA_SOCIAL_CONFIG?.providers?.linkedin||{};
  function statusText(){const c=cfg();if(!c.enabled)return'Désactivé';if(!c.configured||!c.clientId||String(c.clientId).startsWith('REPLACE_'))return'Client ID requis';return'Prêt à connecter';}
  async function act(){try{if(!window.SigmaLinkedIn?.isConfigured?.())throw new Error('Ajoutez le LinkedIn Client ID dans social-config.js, puis déployez les fonctions LinkedIn.');await window.SigmaLinkedIn.connect();}catch(e){alert(e.message);}}
  function render(){
    const card=[...document.querySelectorAll('.v490-provider-card')].find(x=>/linkedin/i.test(x.textContent||''));
    if(card&&!card.querySelector('[data-linkedin-connect]')){const b=document.createElement('button');b.type='button';b.className='button secondary small';b.dataset.linkedinConnect='1';b.textContent='Connecter LinkedIn';b.addEventListener('click',act);card.appendChild(b);}
    const picker=[...document.querySelectorAll('[data-social-provider="linkedin"]')][0]; if(picker) picker.title=statusText();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',render,{once:true}):render();
  window.addEventListener('sigma:social-provider-registered',render);
  window.SigmaLinkedInSetup=Object.freeze({version:'4.9.6',status:statusText,connect:act});
})();
