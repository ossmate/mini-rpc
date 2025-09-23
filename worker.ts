/// <reference lib="webworker" />

const methods = {
  sum: (a: number, b: number) => a + b,
  mul: (a: number, b: number) => a * b,
  fib: (n: number): number => (n <= 1 ? n : methods.fib(n - 1) + methods.fib(n - 2)),
}

self.onmessage = async (event: MessageEvent) => {
  const { id, method, params } = event.data as { id: any; method: keyof typeof methods; params: any[] }

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