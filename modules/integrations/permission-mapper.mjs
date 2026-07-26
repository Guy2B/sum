export function mapScopes(scopes=[]){
  const capabilities=new Set();
  for(const scope of scopes){
    if(/mail|email/i.test(scope)) capabilities.add('email');
    if(/calendar/i.test(scope)) capabilities.add('calendar');
    if(/drive|files|docs/i.test(scope)) capabilities.add('documents');
    if(/contacts/i.test(scope)) capabilities.add('contacts');
  }
  return [...capabilities];
}
