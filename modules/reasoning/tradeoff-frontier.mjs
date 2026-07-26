export function paretoFrontier(options=[],metrics=[]){
  return options.filter((a,i)=>!options.some((b,j)=>j!==i&&metrics.every(m=>m(b)>=m(a))&&metrics.some(m=>m(b)>m(a))));
}
