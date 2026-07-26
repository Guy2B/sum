export function resolveResponsiveLayout(width){
  if(width<640)return{breakpoint:'mobile',columns:1,sidebar:false};
  if(width<1024)return{breakpoint:'tablet',columns:2,sidebar:false};
  return{breakpoint:'desktop',columns:3,sidebar:true};
}
