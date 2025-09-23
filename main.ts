import { createProxyApi } from "./proxyApi";
import type { MethodsImpl } from "./types";

const worker = new Worker(new URL('./worker.ts', import.meta.url));
const api = createProxyApi<MethodsImpl>(worker);

async function run() {
  const sum = await api.sum(2, 3);
  const product = await api.mul(5, 7);
  const fib = await api.fib(20);

  console.log({ sum, product, fib });
}

run().catch(console.error);