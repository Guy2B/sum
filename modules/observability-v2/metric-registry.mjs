export function createMetricRegistry(){
  const metrics=new Map();

  function ensure(name,type){
    const current=metrics.get(name);
    if(current&&current.type!==type) throw new Error('metric type mismatch');
    if(!current){
      metrics.set(name,{name,type,value:0,count:0,sum:0,min:null,max:null});
    }
    return metrics.get(name);
  }

  return {
    increment(name,value=1){
      const metric=ensure(name,'counter');
      metric.value+=value;
      return metric.value;
    },
    gauge(name,value){
      const metric=ensure(name,'gauge');
      metric.value=value;
      return metric.value;
    },
    observe(name,value){
      const metric=ensure(name,'histogram');
      metric.count+=1;
      metric.sum+=value;
      metric.min=metric.min===null?value:Math.min(metric.min,value);
      metric.max=metric.max===null?value:Math.max(metric.max,value);
      return structuredClone(metric);
    },
    get(name){
      const metric=metrics.get(name);
      return metric?structuredClone(metric):null;
    },
    list(){return [...metrics.values()].map(item=>structuredClone(item));}
  };
}
