import EventEmitter from "./eventEmitter";

function createId() {
  return Math.random().toString(36).slice(2);
}

export function createProxyApi<T extends Record<string, (...args: any) => any>>(worker: Worker): { [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
} {
  const emitter = new EventEmitter();

  // listen for responses from worker
  worker.onmessage = (event: MessageEvent) => {
    const { id, result, error } = event.data as { id: any; result?: any; error?: string };

    emitter.emit(id, { result, error });
  };

  return new Proxy({}, {
    get(_target, prop: string) {
      // method call
      return (...params: any[]) => {
        const id = createId()

        // return a promise
        return new Promise((resolve, reject) => {

          //register callback
          emitter.on(id, (msg) => {
            if (msg.error) reject(new Error(msg.error));
            else resolve(msg.result)

            // cleanup
            emitter.off(id, () => { });
          })

          // send request
          worker.postMessage({ id, method: prop, params })
        })
      }
    }
  }
) as any;
}