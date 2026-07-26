export function createReasoningGraph(){
  const nodes=new Map();
  const edges=[];
  return {
    addNode(node){if(!node?.id)throw new Error('node id is required');nodes.set(node.id,structuredClone(node));return structuredClone(node);},
    connect(from,to,type='supports'){if(!nodes.has(from)||!nodes.has(to))throw new Error('unknown node');const edge={from,to,type};edges.push(edge);return structuredClone(edge);},
    snapshot(){return{nodes:[...nodes.values()].map(x=>structuredClone(x)),edges:edges.map(x=>structuredClone(x))};}
  };
}
