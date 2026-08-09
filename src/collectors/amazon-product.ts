import { PlaywrightCrawler } from 'crawlee';
import { parseProductPage } from '../parser/product-parser.js';
import type { NormalizedProduct } from '../domain/model.js';
import { saveRawCapture } from '../services/raw-capture.js';

export async function collectProduct(asin:string, marketplace:string):Promise<NormalizedProduct> {
  let result: NormalizedProduct | undefined; let failure: Error | undefined;
  const crawler = new PlaywrightCrawler({maxRequestRetries:2, requestHandlerTimeoutSecs:45, async requestHandler({page}) { const html=await page.content(); await saveRawCapture({asin,marketplace,html}); result=parseProductPage(html,asin,marketplace); }, async failedRequestHandler({request}) { failure=new Error(`TRANSPORT_ERROR: ${request.errorMessages.join('; ')}`); }});
  await crawler.run([{url:`https://www.amazon.com/dp/${asin}`, userData:{marketplace}}]);
  if (failure) throw failure; if (!result) throw new Error('UNEXPECTED_PAGE'); return result;
}
