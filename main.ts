const worker = new Worker(new URL('./worker.ts', import.meta.url));

["sum", "mul", "fib", "abc"].forEach((method, i) => {
  worker.postMessage({ id: String(i), method, params: method === "fib" ? [10] : [2, 3] });
});

worker.onmessage = (event: MessageEvent) => {
  console.log("Got response:", event.data);
};