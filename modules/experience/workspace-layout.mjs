export function createWorkspaceLayout({sidebar=true,rail=false,panels=[],density='comfortable'}={}){
  return {
    sidebar:Boolean(sidebar),
    rail:Boolean(rail),
    panels:panels.map((p,index)=>({id:p.id||`panel_${index+1}`,size:p.size||'auto',position:p.position||index})),
    density
  };
}
