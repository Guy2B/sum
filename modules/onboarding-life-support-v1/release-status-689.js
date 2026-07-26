(function(g){
  const release=689;
  function local(){
    const meta=document.querySelector('meta[name="sigma-release"]')?.content||null;
    return{
      release,
      metaRelease:meta?Number(meta):null,
      onboarding:window.SigmaOnboardingLifeSupportAcceptanceV1?.validate?.()||null,
      gitCommit:document.querySelector('meta[name="sigma-git-commit"]')?.content||null,
      deployedAt:document.querySelector('meta[name="sigma-deployed-at"]')?.content||null
    };
  }
  g.SigmaReleaseStatus689={release,local};
})(window);
