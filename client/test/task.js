const { createClient, DEFAULT_INTEGRATION_VERSION } = require("../dist/client.js");
const { parentPort, isMainThread } = require('node:worker_threads');

async function retrieveSecret() {
    const client = await createClient({
        auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
        integrationName: "Integration_Test_JS",
        integrationVersion: DEFAULT_INTEGRATION_VERSION,
    })

    return await client.secrets.resolve("op://testingVault/Real Login/password")
}

module.exports = { retrieveSecret }

if (!isMainThread) {
    retrieveSecret().then(secret => { parentPort.postMessage(secret) })
}
