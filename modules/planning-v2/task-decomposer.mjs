export function decomposeTask(task={},templates=[]){
  if(!task.id||!task.title) throw new Error('task id and title are required');

  if(Array.isArray(task.steps)&&task.steps.length){
    return task.steps.map((step,index)=>({
      id:step.id||`${task.id}_step_${index+1}`,
      parentId:task.id,
      title:step.title||String(step),
      status:'pending',
      order:index+1
    }));
  }

  const matched=templates.find(template=>
    template.pattern instanceof RegExp
      ? template.pattern.test(task.title)
      : String(task.title).toLowerCase().includes(String(template.pattern||'').toLowerCase())
  );

  if(!matched) return [{
    id:`${task.id}_step_1`,
    parentId:task.id,
    title:task.title,
    status:'pending',
    order:1
  }];

  return matched.steps.map((title,index)=>({
    id:`${task.id}_step_${index+1}`,
    parentId:task.id,
    title,
    status:'pending',
    order:index+1
  }));
}
