import EventEmitter from "./eventEmitter";

function createId() {
  return Math.random().toString(36).slice(2);
}

export function createProxyApi<
  T extends Record<string, (...args: any[]) => any>
>(
  worker: Worker
): {
  api: { [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> };
  cancelRequest: (id: string) => void;
} {
  const emitter = new EventEmitter();
  const pending = new Map<string, () => void>();

  // listen for responses from worker
  worker.onmessage = (event: MessageEvent) => {
    const { id, result, error } = event.data as { id: any; result?: any; error?: string };

    emitter.emit(id, { result, error });
  };

 const api = new Proxy({}, {
    get(_target, prop: string) {
      return (...params: any[]) => {
        const id = createId();

        const promise = new Promise((resolve, reject) => {
          const handler = (msg: any) => {
            if (msg.error) reject(new Error(msg.error));
            else resolve(msg.result);

            // cleanup
            emitter.off(id, handler);
            pending.delete(id);
          };

          emitter.on(id, handler);

          pending.set(id, () => {
            emitter.off(id, handler);
            pending.delete(id);
            reject(new Error("Request cancelled"));
          });

          // send request to worker
          worker.postMessage({ id, method: prop, params });
        });

        (promise as any).id = id;
        return promise;
      };
    },
  }) as any;

  function cancelRequest(id: string) {
    const cancel = pending.get(id);
    if (cancel) {
      cancel();
      pending.delete(id);

      // optionally let know worker about cancellation
      worker.postMessage({ type: "cancel", id });
    }
  }

  return { api, cancelRequest };
}