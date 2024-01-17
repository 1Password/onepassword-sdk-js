import {
  Client,
  ClientConfiguration,
  defaultIntegrationName,
  defaultIntegrationVersion,
  IntegrationInformation,
  ServiceAccountAuth,
} from "../client";

async function main() {
  let client = await new Client(
    new ClientConfiguration(
      new ServiceAccountAuth("<your_token>"),
      new IntegrationInformation(
        defaultIntegrationName,
        defaultIntegrationVersion,
      ),
    ),
  ).authenticate();

  client.secrets?.resolve("op://Ana/Netflix/website").then(console.log);
}

main();
