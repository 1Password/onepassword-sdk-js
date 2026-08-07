const { createClient, DEFAULT_INTEGRATION_VERSION } = require("../dist/sdk.js");
const { parentPort, isMainThread, workerData } = require('node:worker_threads');

async function retrieveSecret() {
    let saToken;
    if (isMainThread) {
        saToken = process.env.OP_SERVICE_ACCOUNT_TOKEN;
    } else {
        saToken = workerData;
    }
    const client = await createClient({
        auth: saToken,
        integrationName: "Integration_Test_JS",
        integrationVersion: DEFAULT_INTEGRATION_VERSION,
    })

    return await client.secrets.resolve("op://dm42px5dmgusczoarfdubfmodm/2fwfzpvjvaey2lwph5jupovjaq/password")
}

module.exports = { retrieveSecret }

if (!isMainThread) {
    retrieveSecret().then(secret => { parentPort.postMessage(secret) })
}
