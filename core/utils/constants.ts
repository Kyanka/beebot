import {
  DAY_TIME_SELECT_ACTION,
  WEEK_DAY_SELECT_ACTION,
} from "../slack/actions";

export const WEEKDAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEK_DAY_SELECT_BLOCKS = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Choose the connection regular day",
    },
    accessory: {
      type: "static_select",
      placeholder: {
        type: "plain_text",
        text: "Select a day of a week",
        emoji: true,
      },
      options: [
        {
          text: {
            type: "plain_text",
            text: "Monday",
            emoji: true,
          },
          value: "Monday",
        },
        {
          text: {
            type: "plain_text",
            text: "Tuesday",
            emoji: true,
          },
          value: "Tuesday",
        },
        {
          text: {
            type: "plain_text",
            text: "Wednesday",
            emoji: true,
          },
          value: "Wednesday",
        },
        {
          text: {
            type: "plain_text",
            text: "Thursday",
            emoji: true,
          },
          value: "Thursday",
        },
        {
          text: {
            type: "plain_text",
            text: "Friday",
            emoji: true,
          },
          value: "Friday",
        },
      ],
      action_id: WEEK_DAY_SELECT_ACTION,
    },
  },
];

export const DAY_TIME_SELECT_BLOCKS = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Choose a regular connection time",
    },
    accessory: {
      type: "timepicker",
      initial_time: "12:00",
      placeholder: {
        type: "plain_text",
        text: "Select time UTC",
        emoji: true,
      },
      action_id: DAY_TIME_SELECT_ACTION,
    },
  },
];

export const SUCCESSFULL_TIME_BLOCKS = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":bee: Date and time selected successfully!",
    },
  },
];

export const INIT_MESSAGE = (usersLength: number) =>
  `Hi, It's :bee:bot.\n ${usersLength} users were saved to make connections.\n
   Use '/connect' to connect coworkers now.\n
   Use '/regular' to set regular connection time (connection will be delayed to that time).\n
   Use '/stopregular' to stop regular connections.
`;

const INIT_CHAT_MESSAGE =
  "Hello :bee:workers, we're here to make some conversation. So turn off f***** introvert mode and speak!";

export const INIT_CHAT_BLOCKS = (initMessage?: string, topic?: string) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${initMessage ?? INIT_CHAT_MESSAGE}\n ${
        topic ? `Today's topic is:\n '${topic}'` : ""
      }`,
    },
  },
  // {
  //   type: "section",
  //   text: {
  //     type: "mrkdwn",
  //     text: "Click here to start a huddle!",
  //   },
  //   accessory: {
  //     type: "button",
  //     text: {
  //       type: "plain_text",
  //       text: "Huddle Me",
  //       emoji: true,
  //     },
  //     value: "huddle_btn",
  //     url: "lack://huddle",
  //     action_id: "huddle_btn",
  //   },
  // },
];

export const CONNECTION_LOG = (
  pairsLength: number,
  message?: string,
  time?: string
) =>
  `Hi, It's :bee:bot LOGS.\n Today is connection time. Connection will be start at ${
    time || "now"
  } UTC.\n ${pairsLength} pairs are ready to connect.\n ${
    message
      ? `Some users don't have a pair, please contact them or create pair by yourself.\n Users: ${message}`
      : ""
  } `;

export const STOP_REGULAR_CONNECTION_LOG = `Hi, It's :bee:bot LOGS.\n Regular connection was stopped `;

export const LOG_CHANNEL_LOG = (channelName: string) =>
  `Hi, It's :bee:bot LOGS. Log channel was successfully set to the '${channelName}'`;

export const CURRENT_TOPIC_LOG = (topic: string) =>
  `Hi, It's :bee:bot LOGS. Current topic is set to:\n'${topic}'`;

export const CURRENT_INIT_MESSAGE_LOG = (message: string) =>
  `Hi, It's :bee:bot LOGS. Current init message is set to:\n'${message}'`;

export const PAIR_LOG = (emails: string) =>
  `Hi, It's :bee:bot LOGS. ${emails} users are connected`;

export const MESSAGE_LOG = `Hi, It's :bee:bot LOGS. Message is sent`;

export const ADMIN_ERROR_MESSAGE =
  "Sorry, It`s not the admin channel, try non admin command";
