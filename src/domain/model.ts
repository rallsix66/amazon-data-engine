import { z } from 'zod';

export const taskStatus = z.enum(['PENDING','RUNNING','SUCCESS','RETRY','FAILED','ACCESS_LIMITED']);
export type TaskStatus = z.infer<typeof taskStatus>;
export const productSchema = z.object({ asin:z.string(), marketplace:z.string(), productUrl:z.string().url(), title:z.string().nullable(), brand:z.string().nullable(), category:z.array(z.string()), images:z.array(z.string()), parentAsin:z.string().nullable(), currentPrice:z.number().nullable(), listPrice:z.number().nullable(), currency:z.string().nullable(), rating:z.number().nullable(), reviewCount:z.number().int().nullable(), availability:z.string().nullable(), seller:z.string().nullable(), fulfilledBy:z.string().nullable(), prime:z.boolean().nullable() });
export type NormalizedProduct = z.infer<typeof productSchema>;
export type CrawlFailure = { code:'ACCESS_LIMITED'|'CAPTCHA'|'LOGIN_REQUIRED'|'UNEXPECTED_PAGE'|'PARSE_ERROR'|'TRANSPORT_ERROR'; message:string };
