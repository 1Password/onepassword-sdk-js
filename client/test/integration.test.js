const { Worker } = require('node:worker_threads');
const path = require("path");
const { retrieveSecret } = require('./task.js');

// These tests load the WASM core, authenticate, and resolve a secret against the live
// 1Password service, often several clients at once. That regularly takes 3-5 s per test
// on CI runners, right at Jest's 5 s default, so allow more headroom.
jest.setTimeout(30_000);

test("test simple retrieving of secret", async () => {
    let p = retrieveSecret().then(secret => {
        expect(secret).toBe("test_password_42")
    })
    await p
});

test("test retrieving of secret by 5 async clients", async () => {
    let promises = []
    for (let i = 0; i < 5; i++) {
        promises.push(retrieveSecret().then(secret => {
            expect(secret).toBe("test_password_42")
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
    promises.push(p1.then(res => expect(res).toBe("test_password_42")))

    const p2 = new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'task.js'), { workerData: process.env.OP_SERVICE_ACCOUNT_TOKEN });
        worker.on("message", msg => resolve(msg));
        worker.on("error", err => reject(err));
        worker.on("exit", _ => reject());
    });
    promises.push(p2.then(res => expect(res).toBe("test_password_42")))

    await Promise.all(promises)
})
