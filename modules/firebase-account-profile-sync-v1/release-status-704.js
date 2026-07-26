(function(g){
  g.SigmaReleaseStatus704={
    release:704,
    async report(){
      return{
        release:704,
        gitCommit:document.querySelector('meta[name="sigma-git-commit"]')?.content||null,
        deployedAt:document.querySelector('meta[name="sigma-deployed-at"]')?.content||null,
        acceptance:window.SigmaFirebaseAccountProfileSyncAcceptanceV1?.validate?.()||null,
        diagnostics:await window.SigmaFirebaseProfileDiagnosticsV1?.run?.()
      };
    }
  };
})(window);
