import {createSchemaRegistry} from './schema-registry.mjs';
import {createEventBus} from './event-bus.mjs';
import {createHookEngine} from './hook-engine.mjs';
import {createExtensionLoader} from './extension-loader.mjs';
import {evaluateSandboxPolicy} from './sandbox-policy.mjs';
import {createDeveloperAudit} from './developer-audit.mjs';

export function createDeveloperRuntime({allowedCapabilities=[]}={}){
  const schemas=createSchemaRegistry();
  const events=createEventBus();
  const hooks=createHookEngine();
  const audit=createDeveloperAudit();
  const loader=createExtensionLoader({
    policy:extension=>evaluateSandboxPolicy(extension,{allowedCapabilities})
  });
  return {
    registerSchema(name,schema,version){return schemas.register(name,schema,version);},
    subscribe(topic,handler){return events.subscribe(topic,handler);},
    publish(topic,payload){return events.publish(topic,payload);},
    registerHook(name,fn,priority){return hooks.register(name,fn,priority);},
    runHook(name,context){return hooks.run(name,context);},
    loadExtension(extension,module){
      const result=loader.load(extension,module);
      audit.record({type:'extension-loaded',extensionId:extension.id});
      return result;
    },
    extensions(){return loader.list();},
    audit(){return audit.list();}
  };
}
