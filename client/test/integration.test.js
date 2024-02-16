const { Worker } = require('node:worker_threads');
const path = require("path");
const { retrieveSecret } = require('./task.js');

test("test simple retrieving of secret", () => {
    retrieveSecret().then(secret => {
        expect(secret).toBe("password")
    })
});

test("test retrieving of secret by 5 async clients", async () => {
    let promises = []
    for (let i = 0; i < 2; i++) {
        promises.push(retrieveSecret().then(secret => {
            expect(secret).toBe("password")
        }))
    }
    await Promise.all(promises)

});

test("test retrieving of secrets in parallel", async () => {
    let promises = []
    const p1 = new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'task.js'), { workerData: process.env.OP_SERVICE_ACCOUNT_TOKEN });
        worker.on("message", msg => resolve(msg));
        worker.on("error", err => reject(err));
        worker.on("exit", _ => reject());
    });
    promises.push(p1.then(res => expect(res).toBe("password")))

    const p2 = new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'task.js'), { workerData: process.env.OP_SERVICE_ACCOUNT_TOKEN });
        worker.on("message", msg => resolve(msg));
        worker.on("error", err => reject(err));
        worker.on("exit", _ => reject());
    });
    promises.push(p2.then(res => expect(res).toBe("password")))

    await Promise.all(promises)
})