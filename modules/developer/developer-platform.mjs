import {createDeveloperRuntime} from './developer-runtime.mjs';
import {createSdkClient} from './sdk-client.mjs';

export function createDeveloperPlatform({allowedCapabilities=[],transport=async request=>request}={}){
  const runtime=createDeveloperRuntime({allowedCapabilities});
  const sdk=createSdkClient({transport});
  return {
    runtime,
    sdk,
    status(){
      return {
        extensions:runtime.extensions().length,
        auditEntries:runtime.audit().length
      };
    }
  };
}
