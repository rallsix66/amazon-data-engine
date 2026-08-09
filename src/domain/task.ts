import type { TaskStatus } from './model.js';
const allowed: Record<TaskStatus, TaskStatus[]> = {PENDING:['RUNNING'],RUNNING:['SUCCESS','RETRY','FAILED','ACCESS_LIMITED'],RETRY:['RUNNING'],SUCCESS:[],FAILED:[],ACCESS_LIMITED:[]};
export function transition(from: TaskStatus, to: TaskStatus) { if (!allowed[from].includes(to)) throw new Error(`Invalid task transition: ${from} -> ${to}`); return to; }
export function nextRetryDelayMs(attempt: number) { return Math.min(300_000, 1_000 * 2 ** Math.max(0, attempt - 1)); }
