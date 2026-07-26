export function createGitHubAdapter(client){
  return {
    async listSignals({owner,repo,cursor=null}={}){
      return client.listNotifications({owner,repo,cursor});
    },
    normalize(item){
      return {
        externalId:item.id,
        type:item.type||'github-notification',
        title:item.title||'(notification)',
        repository:item.repository||null,
        updatedAt:item.updatedAt||null,
        raw:structuredClone(item)
      };
    }
  };
}
