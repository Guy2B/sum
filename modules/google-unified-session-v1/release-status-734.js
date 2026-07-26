(function(g){
  g.SigmaReleaseStatus734={
    release:734,
    async report(){
      return{
        release:734,
        gitCommit:document.querySelector('meta[name="sigma-git-commit"]')?.content||null,
        deployedAt:document.querySelector('meta[name="sigma-deployed-at"]')?.content||null,
        acceptance:window.SigmaGoogleUnifiedSessionAcceptanceV1?.validate?.()||null,
        diagnostics:await window.SigmaGoogleUnifiedSessionDiagnosticsV1?.run?.()
      };
    }
  };
})(window);
