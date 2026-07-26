export function createExecutionQueue(){
  const queue=[];

  return {
    enqueue(item){
      if(!item?.id) throw new Error('queue item id is required');
      queue.push({...structuredClone(item),queuedAt:new Date().toISOString()});
      return queue.length;
    },

    dequeue(){
      const item=queue.shift();
      return item?structuredClone(item):null;
    },

    peek(){
      const item=queue[0];
      return item?structuredClone(item):null;
    },

    size(){return queue.length;},

    list(){return queue.map(item=>structuredClone(item));}
  };
}
