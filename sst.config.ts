/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "beebot",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          profile: input?.stage === "prod" ? "mozgoprod-prod" : "mozgoprod-dev",
        },
      },
    };
  },

  async run() {
    const slackToken = new sst.Secret("SlackToken");
    const databaseUrl = new sst.Secret("DatabaseUrl");
    const googleCloudClientEmail = new sst.Secret("GoogleCloudClientEmail");
    const googleCloudPrivateKey = new sst.Secret("GoogleCloudPrivateKey");


    const hono = new sst.aws.Function("BeeBotApi", {
      url: true,
      handler: "functions/index.handler",
      link: [slackToken, databaseUrl, googleCloudClientEmail, googleCloudPrivateKey],
    });

    // Cron
    new sst.aws.Cron("BeeBotCron", {
      schedule: "rate(1 day)",
      job: {
        handler: "functions/cron.handler",
        link: [slackToken, databaseUrl],
      },
    });

    return {
      api: hono.url,
    };
  },
});
