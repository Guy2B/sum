import fs from 'node:fs';import path from 'node:path';
const target=process.argv[2];if(!target)throw new Error('Target required');
const app=path.join(target,'app.html');let html=fs.readFileSync(app,'utf8');
if(!html.includes('SIGMA-GOOGLE-UNIFIED-SESSION-V1')){
  html=html.replace('</head>','  <!-- SIGMA-GOOGLE-UNIFIED-SESSION-V1 -->\n  <meta name="sigma-release" content="734">\n  <link rel="stylesheet" href="product/google-unified-session-v1.css?v=720734">\n</head>');
  html=html.replace('</body>','  <script src="product/google-unified-session-v1-loader.js?v=720734"></script>\n  <!-- /SIGMA-GOOGLE-UNIFIED-SESSION-V1 -->\n</body>');
}else{
  html=html.replace(/<meta name="sigma-release" content="\d+">/,'<meta name="sigma-release" content="734">');
}
fs.writeFileSync(app,html,'utf8');
