import {createNavigationModel} from './navigation-model.mjs';
import {createWorkspaceLayout} from './workspace-layout.mjs';
import {rankAttentionItems} from './attention-feed.mjs';
import {resolveResponsiveLayout} from './responsive-policy.mjs';
import {resolveEditionConfig} from './edition-config.mjs';

export function createExperienceOrchestrator({edition='personal'}={}){
  return {
    compose({navigation=[],panels=[],attention=[],width=1280}={}){
      return {
        edition:resolveEditionConfig(edition),
        navigation:createNavigationModel(navigation),
        layout:createWorkspaceLayout({panels,sidebar:resolveResponsiveLayout(width).sidebar}),
        attention:rankAttentionItems(attention),
        responsive:resolveResponsiveLayout(width)
      };
    }
  };
}
