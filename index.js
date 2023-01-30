const redis = require("redis");
const client = redis.createClient();

async function incrementCounter() {
  return new Promise((resolve, reject) => {
    const lockKey = "lock:counter";
    const lockTimeout = 5000;
    client.set(lockKey, 1, "NX", "PX", lockTimeout, (error, reply) => {
      if (error) {
        return reject(error);
      }
      if (!reply) {
        console.log("Failed to acquire lock");
        return resolve();
      }
      client.get("counter", (error, reply) => {
        if (error) {
          return reject(error);
        }
        const counter = parseInt(reply, 10) || 0;
        client.set("counter", counter + 1, (error) => {
          if (error) {
            return reject(error);
          }
          console.log(`Counter value: ${counter + 1}`);
          client.del(lockKey, (error) => {
            if (error) {
              return reject(error);
            }
            resolve();
          });
        });
      });
    });
  });
}

async function main() {
  await Promise.all([
    incrementCounter(),
    incrementCounter(),
    incrementCounter(),
  ]);
  console.log("Done");
  client.quit();
}

main();
