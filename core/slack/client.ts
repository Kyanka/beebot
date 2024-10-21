import { Block, KnownBlock, WebClient } from "@slack/web-api";
import { Resource } from "sst";
import { Settings } from "../settings";
import {
  CURRENT_TOPIC,
  LOGS_CHANNEL,
  REGULAR_INIT_MESSAGE,
} from "../settings/keys";
import { INIT_CHAT_BLOCKS } from "../utils/constants";

export module Client {
  // Initialize
  export const client = new WebClient(Resource.SlackToken.value);

  export async function answerWithBlocks(
    channelId: string,
    blocks: Array<Block | KnownBlock>,
    shedule?: number
  ) {
    if (channelId) {
      if (shedule) {
        return client.chat.scheduleMessage({
          channel: channelId,
          post_at: shedule,
          text: "Message from BeeBot",
          blocks,
        });
      }
      return client.chat.postMessage({
        channel: channelId,
        text: "Message from BeeBot",
        blocks,
      });
    }
  }

  export async function answerWithMessage(
    channelId: string,
    message: string,
    shedule?: number
  ) {
    if (channelId) {
      if (shedule) {
        return client.chat.scheduleMessage({
          channel: channelId,
          post_at: shedule,
          text: "Message from BeeBot",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: message,
              },
            },
          ],
        });
      }

      return client.chat.postMessage({
        channel: channelId,
        text: "Message from BeeBot",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: message,
            },
          },
        ],
        as_user: true,
      });
    }
  }

  export async function getWorkspaceUsers() {
    return client.users.list({ token: Resource.SlackToken.value });
  }

  export async function getActiveUsers() {
    const users = await getWorkspaceUsers();

    return users?.members?.filter(
      (member) =>
        !Boolean(member.is_bot) &&
        !Boolean(member?.deleted) &&
        Boolean(member?.profile?.email) &&
        Boolean(member?.name)
    );
  }

  export async function createGroupChat(guests: string) {
    return client.conversations.open({
      users: guests,
      return_im: false,
    });
  }

  export async function initGroupChat(guests: string, shedule?: number) {
    const group = await createGroupChat(guests);

    const initMessage = (await Settings.getSettingsByKey(REGULAR_INIT_MESSAGE))
      ?.value;
    const topic = (await Settings.getSettingsByKey(CURRENT_TOPIC))?.value;

    if (group.channel?.id) {
      await Client.answerWithBlocks(
        group.channel.id,
        INIT_CHAT_BLOCKS(initMessage, topic),
        shedule
      );
    }

    return group;
  }

  export async function initGroupChatBulk(
    guestsList: string[],
    shedule?: number
  ) {
    const groupPromises = guestsList?.map((guests) =>
      initGroupChat(guests, shedule)
    );
    return Promise.all(groupPromises);
  }

  export async function writeToPair(guests: string, message: string) {
    const group = await createGroupChat(guests);
    if (group.channel?.id) {
      await Client.answerWithMessage(group.channel.id, message);
    }
  }

  export async function writeToChatBulk(guestsList: string[], message: string) {
    const groupPromises = guestsList?.map((guests) =>
      writeToPair(guests, message)
    );
    return Promise.all(groupPromises);
  }

  export async function closeConversation(channelId: string) {
    return client.conversations.close({
      channel: channelId,
      token: Resource.SlackToken.value,
    });
  }

  export async function sendLogs(message: string) {
    const logChannelId = (await Settings.getSettingsByKey(LOGS_CHANNEL))?.value;
    if (logChannelId && message) {
      answerWithMessage(logChannelId, message);
    }
  }
}
