export type MethodMap = {
  sum: [number, number];
  mul: [number, number];
  fib: [number];
};

export type MethodsImpl = {
  sum: (a: number, b: number) => number;
  mul: (a: number, b: number) => number;
  fib: (n: number) => number;
};