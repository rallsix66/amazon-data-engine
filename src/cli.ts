import { collectProduct } from './collectors/amazon-product.js';
const [mode, asin, marketplace='US']=process.argv.slice(2);
if(mode!=='product'||!asin) { console.error('Usage: npm run dev -- product <ASIN> [marketplace]'); process.exit(1); }
collectProduct(asin,marketplace).then(r=>console.log(JSON.stringify(r,null,2))).catch(error=>{ console.error(error.message); process.exitCode=1; });
