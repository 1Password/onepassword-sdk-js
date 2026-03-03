const sdk = require('@1password/sdk');
(async () => {
  await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: 'Test',
    integrationVersion: '1.0.0',
  });
  console.log('Client created; waiting 5s for CC test log...');
  await new Promise(r => setTimeout(r, 5000));
})();