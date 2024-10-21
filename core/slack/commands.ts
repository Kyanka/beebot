import { Client } from "./client";
import { UserDto } from "../user/user.dto";
import { User } from "../user";
import { MeetingBatch } from "../meeting-batch";
import {
  CONNECTION_LOG,
  CURRENT_INIT_MESSAGE_LOG,
  CURRENT_TOPIC_LOG,
  INIT_MESSAGE,
  LOG_CHANNEL_LOG,
  MESSAGE_LOG,
  PAIR_LOG,
  STOP_REGULAR_CONNECTION_LOG,
  WEEK_DAY_SELECT_BLOCKS,
} from "../utils/constants";
import { Settings } from "../settings";
import {
  CURRENT_TOPIC,
  LOGS_CHANNEL,
  REGULAR_CONNECTION,
  REGULAR_INIT_MESSAGE,
} from "../settings/keys";
import moment from "moment";
import { Slack } from ".";

export module Commands {
  const usersMock = [
    {
      id: "U0655PH99FY",
      name: "julia.olefir",
      profile: { email: "julia.olefir@codeandcakes.com" },
    },
    {
      id: "U057Q7R57B5",
      name: "julia.konerskaya",
      profile: { email: "julia.konerskaya@codeandcakes.com" },
    },
    {
      id: "U079F6LMG3W",
      name: "maria.serdiukova",
      profile: { email: "maria.serdiukova@codeandcakes.com" },
    },
  ];

  export async function init(channelId: string) {
    // Get user from Slack
    const users = await Client.getActiveUsers();
    const usersDto = users?.map((u) => ({
      slackId: u.id,
      email: u.profile?.email,
      name: u?.name,
    })) as UserDto[];

    // Insert users to db
    await User.insertUserList(usersDto);
    const dbUsers = await User.list();

    // Shafle users into pairs and create a meeting batch
    await MeetingBatch.initBatch();

    return await Client.answerWithMessage(
      channelId,
      INIT_MESSAGE(dbUsers.length)
    );
  }

  export async function setRegularConnection(channelId: string) {
    return Client.answerWithBlocks(channelId, WEEK_DAY_SELECT_BLOCKS);
  }

  export async function makeUserConnections(shedule?: string) {
    const [hours, minutes] = shedule?.split(":") ?? [];

    const connectionDate = shedule
      ? moment()
          .utc()
          .set({ hours: Number(hours), minutes: Number(minutes) })
          .unix()
      : 0;

    // Execute last not executed batch, gets shuffled users
    const guestsList = await MeetingBatch.executeLastBatch(connectionDate);

    if (guestsList?.length) {
      // Create private chats and shedule a messages from bot
      await Client.initGroupChatBulk(guestsList, connectionDate);

      // Get not connected users
      const userEmailsMessage = await User.getUnpairedUserEmail();

      // Create new not executed batch
      await MeetingBatch.initBatch();

      return await Client.sendLogs(
        CONNECTION_LOG(guestsList.length, userEmailsMessage, shedule)
      );
    }
  }

  export async function setLogChannel(channelId: string) {
    await Settings.setSettingsByKey(LOGS_CHANNEL, channelId);

    return Client.sendLogs(LOG_CHANNEL_LOG(channelId));
  }

  export async function closeConversation(channelId: string) {
    await Client.closeConversation(channelId);
  }

  export async function stopRegularConnection() {
    await Settings.setSettingsByKey(REGULAR_CONNECTION, "false");

    return Client.sendLogs(STOP_REGULAR_CONNECTION_LOG);
  }

  export async function setTopic(value: string) {
    await Settings.setSettingsByKey(CURRENT_TOPIC, value);

    return Client.sendLogs(CURRENT_TOPIC_LOG(value));
  }

  export async function setInitMessage(value: string) {
    await Settings.setSettingsByKey(REGULAR_INIT_MESSAGE, value);

    return Client.sendLogs(CURRENT_INIT_MESSAGE_LOG(value));
  }

  export async function connectPair(input: string) {
    const userNames = input.replaceAll("@", "").split(" ");
    const users = await User.getUserListByNames(userNames);

    if (users.length === 2) {
      const usersSlackIds = `${users[0]?.slackId}, ${users[1]?.slackId}`;
      await Slack.Client.initGroupChat(usersSlackIds);

      return Client.sendLogs(PAIR_LOG(input));
    }
  }

  export async function writeToExecutedBatchGroups(message: string) {
    const lastExecutedBatch = await MeetingBatch.getLastBatch(true);

    if (lastExecutedBatch?.meetings?.length) {
      const formattedUserIds = lastExecutedBatch.meetings.map(
        (m) => `${m.firstGuest.slackId}, ${m.secondGuest.slackId}`
      );

      await Client.writeToChatBulk(formattedUserIds, message);
    }

    return Client.sendLogs(MESSAGE_LOG);
  }

  export async function getGoogleMeetLink() {}
}
