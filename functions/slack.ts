import { Hono } from "hono";
import { Slack } from "../core/slack";
import { GoogleCalendar } from "../core/google-meet";
import { Settings } from "../core/settings";
import { ADMIN_ERROR_MESSAGE } from "../core/utils/constants";

const app = new Hono();

async function adminGuard<T>(
  channelId: string,
  callback: (params: T) => Promise<any>,
  params: T
) {
  const isAdminChannel = await Settings.isAdminChannel(channelId);

  if (isAdminChannel) {
    return callback(params);
  } else {
    await Slack.Client.answerWithMessage(channelId, ADMIN_ERROR_MESSAGE);
  }
}

app.post("/commands/init", async (ctx) => {
  console.log("INIT COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string") {
    await adminGuard(body?.channel_id, Slack.Commands.init, body.channel_id);
  }

  return ctx.json("ok");
});

app.post("/commands/regular", async (ctx) => {
  console.log("REGULAR COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body.channel_id === "string") {
    await adminGuard(
      body?.channel_id,
      Slack.Commands.setRegularConnection,
      body.channel_id
    );
  }

  return ctx.json("ok");
});

app.post("/commands/stopregular", async (ctx) => {
  console.log("STOP REGULAR COMMAND");
  const body = await ctx.req.parseBody();

  if (typeof body.channel_id === "string") {
    await adminGuard(
      body?.channel_id,
      Slack.Commands.stopRegularConnection,
      undefined
    );
  }

  return ctx.json("ok");
});

app.post("/commands/connect", async (ctx) => {
  console.log("CONNECT COMMAND");
  const body = await ctx.req.parseBody();

  if (typeof body.channel_id === "string") {
    await adminGuard(
      body?.channel_id,
      Slack.Commands.makeUserConnections,
      undefined
    );
  }

  return ctx.json("ok");
});

app.post("/commands/closeconv", async (ctx) => {
  // Close conversation only for bot, lol
  console.log("CLOSE CONVERSATION COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string") {
    await adminGuard(
      body?.channel_id,
      Slack.Commands.closeConversation,
      body.channel_id
    );
  }

  return ctx.json("ok");
});

app.post("/commands/logchannel", async (ctx) => {
  console.log("LOG CHANNEL COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string" && typeof body?.text === "string") {
    await adminGuard(
      body?.channel_id,
      Slack.Commands.setLogChannel,
      body?.text
    );
  }

  return ctx.json("ok");
});

app.post("/commands/settopic", async (ctx) => {
  console.log("LOG CHANNEL COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string" && typeof body?.text === "string") {
    await adminGuard(body?.channel_id, Slack.Commands.setTopic, body?.text);
  }

  return ctx.json("ok");
});

app.post("/commands/initmessage", async (ctx) => {
  console.log("LOG CHANNEL COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string" && typeof body?.text === "string") {
    await adminGuard(
      body?.channel_id,
      Slack.Commands.setInitMessage,
      body?.text
    );
  }

  return ctx.json("ok");
});

app.post("/commands/opengroupmessage", async (ctx) => {
  console.log("LOG CHANNEL COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string" && typeof body?.text === "string") {
    await adminGuard(
      body?.channel_id,
      Slack.Commands.writeToExecutedBatchGroups,
      body?.text
    );
  }

  return ctx.json("ok");
});

app.post("/commands/pair", async (ctx) => {
  console.log("LOG CHANNEL COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string" && typeof body?.text === "string") {
    await adminGuard(body?.channel_id, Slack.Commands.connectPair, body?.text);
  }

  return ctx.json("ok");
});

app.post("/commands/gmeet", async (ctx) => {
  console.log("LOG CHANNEL COMMAND");

  const body = await ctx.req.parseBody();

  if (typeof body?.channel_id === "string") {
    Slack.Client.answerWithMessage(
      body?.channel_id,
      "Sorry, I can`t do this for now"
    );
  }

  return ctx.json("ok");
});

app.post("/interactions", async (ctx) => {
  const body = await ctx.req.parseBody();

  if (typeof body?.payload === "string") {
    const payload = await JSON.parse(body.payload);
    const responseUrl = payload.response_url;
    const selectedAction = payload.actions[0];
    const selectedActionId = selectedAction?.action_id;

    console.log(String(selectedActionId).toUpperCase(), "INTERACTION");

    Slack.Interactions.reduceInteractions(
      selectedActionId,
      responseUrl,
      selectedAction
    );
  }

  return ctx.json("ok");
});

app.post("/events", async (ctx) => {
  const body = await ctx.req.json();
  const event = body.event;

  if (
    !Boolean(event?.bot_profile) &&
    !Boolean(event?.command) &&
    Boolean(event.channel) &&
    Boolean(event?.message?.subtype !== "bot_message")
  ) {
    console.log("EVENTS WEBHOOK");

    await Slack.Client.answerWithMessage(
      event.channel,
      "BeeBot is working hard, don`t disturb pls"
    );

    return ctx.json("ok");
  }

  return ctx.json(body);
});

app.get("/gmeet", async (ctx) => {
  // Just for testing
  const res = await GoogleCalendar.createMeeting();

  return ctx.json(res);
});

export default app;
