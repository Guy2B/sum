(function(g){
  function analyze(entries){
    const rows=entries||[];const tags={};let positives=0,challenges=0;
    for(const e of rows){
      for(const tag of e.tags||[])tags[tag]=(tags[tag]||0)+1;
      const text=String(e.text||'').toLowerCase();
      if(/réussi|progress|fier|heureux|gratitude|accompli/.test(text))positives++;
      if(/diffic|bloqu|stress|fatigu|problème/.test(text))challenges++;
    }
    const topTags=Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([tag,count])=>({tag,count}));
    return{entries:rows.length,positives,challenges,topTags,balance:rows.length?Math.round((positives-challenges)/rows.length*100):0};
  }
  function weeklyPrompt(entries){const a=analyze(entries);if(!a.entries)return'Quel moment de cette semaine aimeriez-vous conserver ?';if(a.challenges>a.positives)return'Qu’est-ce qui vous a le plus coûté cette semaine, et quel soutien serait utile ?';return'Quel progrès mérite d’être reconnu cette semaine ?';}
  g.SigmaJourneyInsightsV3={analyze,weeklyPrompt};
})(window);
