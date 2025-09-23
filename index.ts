import EventEmitter from "./eventEmitter";


const ee = new EventEmitter()

ee.on("greet", (name: string) => {
  console.log(`Hello, ${name}!`);
});

ee.emit("greet", "Alice");
setTimeout(() => {
  ee.emit("greet", "Bob");
}, 5000);