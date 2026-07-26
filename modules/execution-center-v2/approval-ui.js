(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    if(document.getElementById('sigma-approval-center'))return;
    const action=document.getElementById('sigma-action-center');
    const card=document.createElement('article');card.id='sigma-approval-center';card.className='card sigma-approval-center';
    card.innerHTML='<div class="card-heading"><div><span class="eyebrow">Contrôle humain</span><h2>Approbations et exécutions</h2></div><span><b data-ap-pending>0</b> en attente</span></div><div id="sigma-approval-list"></div><details><summary>Historique d’exécution</summary><div id="sigma-execution-history"></div></details>';
    action?.parentNode?.insertBefore(card,action.nextSibling);
  }
  function render(){
    ensure();
    const pending=window.SigmaApprovalQueue.pending();
    const count=document.querySelector('[data-ap-pending]');if(count)count.textContent=pending.length;
    const list=document.getElementById('sigma-approval-list');
    if(list)list.innerHTML=pending.map(r=>`<article class="sigma-approval-row"><div><strong>${esc(r.operation)}</strong><small>${esc(r.provider)} · risque ${esc(r.risk)}</small><p>Action ${esc(r.actionId)}</p></div><div><button data-approve="${esc(r.id)}">Approuver</button><button data-reject="${esc(r.id)}">Refuser</button></div></article>`).join('')||'<p class="muted">Aucune approbation en attente.</p>';
    list?.querySelectorAll('[data-approve]').forEach(b=>b.addEventListener('click',()=>{window.SigmaExecutionEngine.approve(b.dataset.approve);render();}));
    list?.querySelectorAll('[data-reject]').forEach(b=>b.addEventListener('click',()=>{window.SigmaExecutionEngine.reject(b.dataset.reject);render();}));
    const history=document.getElementById('sigma-execution-history');
    if(history)history.innerHTML=window.SigmaExecutionAudit.list().slice(0,30).map(x=>`<p><strong>${esc(x.type)}</strong> · ${new Date(x.at).toLocaleString()}</p>`).join('')||'<p class="muted">Aucune exécution enregistrée.</p>';
  }
  function boot(){
    ensure();render();
    window.addEventListener('sigma:approval-queue-updated',render);
    window.addEventListener('sigma:execution-completed',render);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500),{once:true}):setTimeout(boot,500);
  g.SigmaApprovalUI={render};
})(window);
