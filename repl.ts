import * as readline from "readline";
import { createProxyApi } from "./proxyApi";
import type { MethodsImpl } from "./types";

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, { type: "module" });
const api = createProxyApi<MethodsImpl>(worker);

// Create a simple interactive shell using readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

// Make api available globally
(global as any).api = api;

console.log("🎉 Granted access to `api`, e.g.:");
console.log("await api.sum(2,3)");
console.log("await api.fib(10)");
console.log("Type 'exit' to quit");

rl.prompt();

rl.on('line', async (input: string) => {
  const trimmed = input.trim();

  if (trimmed === 'exit') {
    rl.close();
    return;
  }

  if (trimmed) {
    try {
      // Simple eval - be careful in production!
      const result = await eval(trimmed);
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});