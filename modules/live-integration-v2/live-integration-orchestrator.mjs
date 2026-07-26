import {createConnectorRegistry} from './connector-registry.mjs';
import {createSyncCursorStore} from './sync-cursor-store.mjs';
import {createLiveDataStore} from './live-data-store.mjs';
import {createSyncDiagnostics} from './sync-diagnostics.mjs';
import {createSyncEngine} from './sync-engine.mjs';
import {buildAppViewModel} from './app-view-model.mjs';

export function createLiveIntegrationOrchestrator({
  priorityOptions={}
}={}){
  const registry=createConnectorRegistry();
  const cursors=createSyncCursorStore();
  const store=createLiveDataStore();
  const diagnostics=createSyncDiagnostics();
  const engine=createSyncEngine({registry,cursors,store,diagnostics,priorityOptions});

  return {
    register(connector){return registry.register(connector);},
    connect(id,context={}){return registry.connect(id,context);},
    sync(id,context={}){return engine.syncConnector(id,context);},
    subscribe(listener){return store.subscribe(snapshot=>listener(buildAppViewModel(snapshot)));},
    view(){return buildAppViewModel(store.snapshot());},
    diagnostics(){return diagnostics.summary();},
    raw(){return {registry,cursors,store,diagnostics};}
  };
}
