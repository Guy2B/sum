/** Sigma Life OS Gemini proxy. Store GEMINI_API_KEY in Script Properties. */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'geminiRewrite') return json_({ ok:false, error:'UNKNOWN_ACTION' });
    var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!key) return json_({ ok:false, error:'GEMINI_API_KEY_NOT_CONFIGURED' });
    var prompt = ['You are Sigma, a cautious life and work coach. Do not invent facts.', 'User question:', body.prompt || '', 'Verified context:', body.contextSummary || '', 'Answer to preserve:', body.deterministicText || '', 'Rewrite in language: ' + (body.language || 'fr')].join('\n\n');
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
    var response = UrlFetchApp.fetch(url, { method:'post', contentType:'application/json', muteHttpExceptions:true, payload:JSON.stringify({ contents:[{ parts:[{ text:prompt }] }], generationConfig:{ temperature:0.2, maxOutputTokens:1200 } }) });
    var data = JSON.parse(response.getContentText() || '{}');
    var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.map(function(p){return p.text||'';}).join('\n');
    return json_({ ok:response.getResponseCode() < 300, text:text || '', status:response.getResponseCode() });
  } catch (err) { return json_({ ok:false, error:String(err) }); }
}
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
