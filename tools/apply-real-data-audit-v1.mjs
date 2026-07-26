import fs from 'node:fs';import path from 'node:path';
const target=process.argv[2];if(!target)throw new Error('Target required');
const app=path.join(target,'app.html');let html=fs.readFileSync(app,'utf8');
if(!html.includes('SIGMA-REAL-DATA-AUDIT-V1')){
  html=html.replace('</head>','  <!-- SIGMA-REAL-DATA-AUDIT-V1 -->\n  <meta name="sigma-release" content="644">\n  <link rel="stylesheet" href="product/real-data-audit-v1.css?v=630644">\n</head>');
  html=html.replace('</body>','  <script src="product/real-data-audit-v1-loader.js?v=630644"></script>\n  <!-- /SIGMA-REAL-DATA-AUDIT-V1 -->\n</body>');
}else{
  html=html.replace(/<meta name="sigma-release" content="\d+">/,'<meta name="sigma-release" content="644">');
}
fs.writeFileSync(app,html,'utf8');
