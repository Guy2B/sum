import fs from 'node:fs';import path from 'node:path';
const target=process.argv[2];if(!target)throw new Error('Target required');
const app=path.join(target,'app.html');let html=fs.readFileSync(app,'utf8');
if(!html.includes('SIGMA-ONBOARDING-LIFE-SUPPORT-V1')){
  html=html.replace('</head>','  <!-- SIGMA-ONBOARDING-LIFE-SUPPORT-V1 -->\n  <meta name="sigma-release" content="689">\n  <link rel="stylesheet" href="product/onboarding-life-support-v1.css?v=675689">\n</head>');
  html=html.replace('</body>','  <script src="product/onboarding-life-support-v1-loader.js?v=675689"></script>\n  <!-- /SIGMA-ONBOARDING-LIFE-SUPPORT-V1 -->\n</body>');
}else{
  html=html.replace(/<meta name="sigma-release" content="\d+">/,'<meta name="sigma-release" content="689">');
}
fs.writeFileSync(app,html,'utf8');
