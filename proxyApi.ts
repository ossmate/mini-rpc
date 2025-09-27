import EventEmitter from "./eventEmitter";

function createId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function createProxyApi<
  T extends Record<string, (...args: any[]) => any>
>(
  worker: Worker
): {
  api: {
    [K in keyof T]: (
      ...args: [...Parameters<T[K]>, options?: { timeout?: number }]
    ) => Promise<ReturnType<T[K]>>;
  };
  cancelRequest: (id: string) => void;
} {
  const emitter = new EventEmitter();
  const pending = new Map<string, () => void>();

  worker.onmessage = (event: MessageEvent) => {
    const { id, result, error, type, value } = event.data as {
      id: string;
      result?: any;
      error?: string;
      type?: string;
      value?: any;
    };

    if (type === "progress") {
      emitter.emit(`${id}:progress`, value);
      return;
    }

    emitter.emit(id, { result, error });
  };

  const api = new Proxy({}, {
    get(_target, prop: string) {
      return (...allParams: any[]) => {
        const id = createId();
        const lastArg = allParams[allParams.length - 1];

        let options: { timeout?: number } = {};
        let params = allParams;

        if (lastArg && typeof lastArg === "object" && "timeout" in lastArg) {
          options = lastArg as { timeout?: number };
          params = params.slice(0, -1);
        }

        const promise: any = new Promise((resolve, reject) => {
          const handler = (msg: { result?: any; error?: string }) => {
            if (msg.error) reject(new Error(msg.error));
            else resolve(msg.result);

            cleanup();
          };

          const timeoutId: ReturnType<typeof setTimeout> | null = options.timeout
            ? setTimeout(() => {
                cancelRequest(id);
                reject(new Error(`Request timed out after: ${options.timeout}ms`));
              }, options.timeout)
            : null;

          const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            emitter.off(id, handler);
            pending.delete(id);
          };

          emitter.on(id, handler);

          pending.set(id, () => {
            cleanup();
            reject(new Error("Request cancelled"));
          });

          worker.postMessage({ id, method: prop, params });
        });

        promise.id = id;
        return promise;
      };
    },
  }) as any;

  function cancelRequest(id: string) {
    const cancel = pending.get(id);
    if (cancel) {
      cancel();
      worker.postMessage({ type: "cancel", id });
    }
  }

  return { api, cancelRequest };
}