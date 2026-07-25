'use strict';
const test=require('node:test'); const assert=require('node:assert/strict'); const {UnifiedConnectorFramework}=require('../../modules/connectors/unified-connector-framework');
test('normalizes connector sync results',async()=>{const f=new UnifiedConnectorFramework();f.register('demo',{authenticate:async()=>true,sync:async()=>[{x:1}],incrementalSync:async()=>[{x:2}],normalize:rows=>rows.map(r=>({value:r.x})),healthCheck:async()=>({ok:true}),disconnect:async()=>true});assert.deepEqual(await f.sync('demo'),[{value:1}]);assert.equal((await f.health()).demo.ok,true);});
