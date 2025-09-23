import { createProxyApi } from "./proxyApi";
import type { MethodsImpl } from "./types";

const worker = new Worker(new URL('./worker.ts', import.meta.url));
const api = createProxyApi<MethodsImpl>(worker);

async function testFn() {
  const s = await api.sum(2, 3);
  const m = await api.mul(3, 4);
  const f = await api.fib(10);

  return [s, m, f];
}

testFn().then(console.log).catch(console.error);

// ["sum", "mul", "fib", "abc"].forEach((method, i) => {
//   worker.postMessage({ id: String(i), method, params: method === "fib" ? [10] : [2, 3] });
// });

// worker.onmessage = (event: MessageEvent) => {
//   console.log("Got response:", event.data);
// };