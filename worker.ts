/// <reference lib="webworker" />

import type { MethodsImpl } from "./types";

const methods: MethodsImpl = {
  sum: (a, b) => a + b,
  mul: (a, b) => a * b,
  fib: (n) => (n <= 1 ? n : methods.fib(n - 1) + methods.fib(n - 2)),
};

self.onmessage = async (event: MessageEvent) => {
  const { id, method, params } = event.data as {
    id: string;
    method: keyof MethodsImpl;
    params: unknown[];
  };

  if (methods[method]) {
    try {
      const result = (methods[method] as (...args: any[]) => any)(...params);

      self.postMessage({ id, result })
    } catch (error: any) {
      self.postMessage({ id, error: error.message })
    }
  } else {
    self.postMessage({ id, error: 'Method not found' })
  }
}