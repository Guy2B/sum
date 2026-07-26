export function reflectOnOutcome({goal,result,expected}={}){
  const matched=JSON.stringify(result)===JSON.stringify(expected);
  return {
    goal,
    matched,
    lesson:matched?'strategy-confirmed':'strategy-adjustment-required',
    result:structuredClone(result),
    expected:structuredClone(expected)
  };
}
