import fs from 'node:fs';import path from 'node:path';
const target=process.argv[2];if(!target)throw new Error('Target required');
const app=path.join(target,'app.html');let html=fs.readFileSync(app,'utf8');
if(!html.includes('SIGMA-FIREBASE-ACCOUNT-PROFILE-SYNC-V1')){
  html=html.replace('</head>','  <!-- SIGMA-FIREBASE-ACCOUNT-PROFILE-SYNC-V1 -->\n  <meta name="sigma-release" content="704">\n  <link rel="stylesheet" href="product/firebase-account-profile-sync-v1.css?v=690704">\n</head>');
  html=html.replace('</body>','  <script src="product/firebase-account-profile-sync-v1-loader.js?v=690704"></script>\n  <!-- /SIGMA-FIREBASE-ACCOUNT-PROFILE-SYNC-V1 -->\n</body>');
}else{
  html=html.replace(/<meta name="sigma-release" content="\d+">/,'<meta name="sigma-release" content="704">');
}
fs.writeFileSync(app,html,'utf8');
