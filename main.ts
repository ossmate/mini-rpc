import EventEmitter from "./eventEmitter";
import { createProxyApi } from "./proxyApi";
import type { MethodsImpl } from "./types";

const worker = new Worker(new URL('./worker.ts', import.meta.url));
const api = createProxyApi<MethodsImpl>(worker);

const emitter = new EventEmitter();

function handler1(data: any) {
  console.log("handler1", data);
}
function handler2(data: any) {
  console.log("handler2", data);
}

emitter.on("test", handler1);
emitter.on("test", handler2);

console.log("Emit przed removeAll:");
emitter.emit("test", "hello");

emitter.removeAllListeners("test");
console.log("Emit po removeAll(test):");
emitter.emit("test", "world");

async function run() {
  const sum = await api.sum(2, 3);
  const product = await api.mul(5, 7);
  const fib = await api.fib(20);

  console.log({ sum, product, fib });
}

run().catch(console.error);