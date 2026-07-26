export function createNotificationCenter(){
  const items=[];
  return {
    push(notification){
      const item={id:notification.id||`notification_${items.length+1}`,read:false,createdAt:new Date().toISOString(),...structuredClone(notification)};
      items.push(item);return structuredClone(item);
    },
    markRead(id){const item=items.find(x=>x.id===id);if(!item)return null;item.read=true;return structuredClone(item);},
    list({unreadOnly=false}={}){return items.filter(x=>!unreadOnly||!x.read).map(x=>structuredClone(x));}
  };
}
