import fs from 'node:fs';import path from 'node:path';
const target=process.argv[2];if(!target)throw new Error('Target required');
const app=path.join(target,'app.html');let html=fs.readFileSync(app,'utf8');
if(!html.includes('SIGMA-PRODUCT-CONSOLIDATION-V4')){
 html=html.replace('</head>','  <!-- SIGMA-PRODUCT-CONSOLIDATION-V4 -->\n  <meta name="sigma-release" content="629">\n  <link rel="stylesheet" href="product/product-consolidation-v4.css?v=615629">\n</head>');
 html=html.replace('</body>','  <script src="product/product-consolidation-v4-loader.js?v=615629"></script>\n  <!-- /SIGMA-PRODUCT-CONSOLIDATION-V4 -->\n</body>');
}else{
 html=html.replace(/<meta name="sigma-release" content="\d+">/,'<meta name="sigma-release" content="629">');
}
fs.writeFileSync(app,html,'utf8');
