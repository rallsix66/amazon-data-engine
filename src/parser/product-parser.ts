import { productSchema, type NormalizedProduct } from '../domain/model.js';
const textById = (html:string, id:string) => { const m=html.match(new RegExp(`<[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i')); return m?.[1]?.replace(/<[^>]*>/g,'').trim() ?? null; };
export function parseProductPage(html:string, asin:string, marketplace:string): NormalizedProduct {
  if (/captcha|robot check|enter the characters you see below/i.test(html)) throw new Error('CAPTCHA');
  if (/sign in|login/i.test(html) && !/productTitle/i.test(html)) throw new Error('LOGIN_REQUIRED');
  const title=textById(html,'productTitle');
  if (!title) throw new Error('UNEXPECTED_PAGE');
  const priceMatch=html.match(/a-price-whole[^>]*>\s*([\d,.]+)/i);
  const ratingMatch=html.match(/([0-5](?:\.\d)?)\s+out of 5 stars/i);
  const reviewMatch=html.match(/([\d,]+)\s+(?:global ratings|ratings)/i);
  const imageUrls=[...html.matchAll(/https?:[^"'\\s]+(?:jpg|jpeg|png)/gi)].map(m=>m[0]).slice(0,20);
  return productSchema.parse({asin, marketplace, productUrl:`https://www.amazon.${marketplace==='US'?'com':'com'}/dp/${asin}`, title, brand:textById(html,'bylineInfo'), category:[], images:[...new Set(imageUrls)], parentAsin:null, currentPrice:priceMatch?Number(priceMatch[1].replace(',','')):null, listPrice:null, currency:priceMatch?'USD':null, rating:ratingMatch?Number(ratingMatch[1]):null, reviewCount:reviewMatch?Number(reviewMatch[1].replace(/,/g,'')):null, availability:null, seller:null, fulfilledBy:null, prime:null});
}
