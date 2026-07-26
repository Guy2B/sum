export function createExperienceShell({orchestrator,notifications,viewState}={}){
  return {
    render(input){
      const model=orchestrator.compose(input);
      return {
        ...model,
        notifications:notifications?.list?.()||[],
        view:viewState?.get?.()||{}
      };
    }
  };
}
