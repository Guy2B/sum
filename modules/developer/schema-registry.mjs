export function createSchemaRegistry(){
  const schemas=new Map();
  return {
    register(name,schema,version='1'){
      const key=`${name}@${version}`;
      schemas.set(key,structuredClone(schema));
      return {name,version};
    },
    get(name,version='1'){
      const value=schemas.get(`${name}@${version}`);
      return value?structuredClone(value):null;
    },
    list(){
      return [...schemas.keys()].map(key=>{
        const [name,version]=key.split('@');
        return {name,version};
      });
    }
  };
}
