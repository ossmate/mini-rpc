# mini-rpc

A lightweight, type-safe RPC (Remote Procedure Call) implementation using Web Workers in TypeScript. This project demonstrates how to create a proxy-based API that seamlessly executes methods in a Web Worker, providing asynchronous, non-blocking computation.

## Features

- 🔧 **Type-safe**: Full TypeScript support with proper type inference
- 🚀 **Non-blocking**: All computations run in a Web Worker
- 🎯 **Promise-based**: Clean async/await API
- 📦 **Lightweight**: Minimal dependencies, built with Bun
- 🔗 **Proxy-based**: Automatic method proxying for seamless RPC calls

## Architecture

The project consists of several key components:

- **`proxyApi.ts`**: Creates a Proxy that intercepts method calls and forwards them to the worker
- **`worker.ts`**: Web Worker that executes the actual computation methods
- **`eventEmitter.ts`**: Custom event emitter for handling worker communication
- **`types.ts`**: TypeScript definitions for method signatures
- **`main.ts`**: Example usage of the RPC system

## Installation

```bash
bun install
```

## Usage

### Basic Example

```typescript
import { createProxyApi } from "./proxyApi";
import type { MethodsImpl } from "./types";

// Create a worker and proxy API
const worker = new Worker(new URL('./worker.ts', import.meta.url));
const api = createProxyApi<MethodsImpl>(worker);

// Use the API as if methods were local
async function example() {
  const sum = await api.sum(2, 3);        // 5
  const product = await api.mul(5, 7);    // 35
  const fibonacci = await api.fib(10);    // 55

  console.log({ sum, product, fibonacci });
}
```

### Running the Examples

```bash
# Run the main example
bun run main.ts

# Run the basic event emitter example
bun run index.ts

# Run the REPL for interactive testing
bun run repl.ts
```

## Adding New Methods

1. Define the method signature in `types.ts`:
```typescript
export type MethodMap = {
  sum: [number, number];
  mul: [number, number];
  fib: [number];
  // Add your new method here
  power: [number, number];
};

export type MethodsImpl = {
  sum: (a: number, b: number) => number;
  mul: (a: number, b: number) => number;
  fib: (n: number) => number;
  // Add the implementation signature
  power: (base: number, exponent: number) => number;
};
```

2. Implement the method in `worker.ts`:
```typescript
const methods: MethodsImpl = {
  sum: (a, b) => a + b,
  mul: (a, b) => a * b,
  fib: (n) => (n <= 1 ? n : methods.fib(n - 1) + methods.fib(n - 2)),
  // Add your implementation
  power: (base, exponent) => Math.pow(base, exponent),
};
```

3. Use the new method:
```typescript
const result = await api.power(2, 8); // 256
```

## How It Works

1. **Proxy Creation**: `createProxyApi` returns a Proxy object that intercepts all property access
2. **Method Interception**: When you call `api.sum(2, 3)`, the Proxy catches this and generates a unique ID
3. **Worker Communication**: The call is serialized and sent to the Web Worker via `postMessage`
4. **Execution**: The worker executes the method and sends the result back
5. **Promise Resolution**: The original Promise resolves with the worker's result

## Requirements

- [Bun](https://bun.com) v1.2.22 or higher
- TypeScript 5+

## License

This project was created using `bun init` and is intended for educational purposes.
