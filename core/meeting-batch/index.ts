import { desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "../drizzle";
import { meetingBatch } from "./meeting-batch.sql";
import { Meeting } from "../meeting";
import { GuestsDto } from "../meeting/meeting.dto";
import { User } from "../user";
import { Settings } from "../settings";
import { NO_CONNECTION_USERS } from "../settings/keys";

export module MeetingBatch {
  export async function shafleUserPairs() {
    const users = await User.getUserListWithLastMeetings();

    if (users?.length) {
      const userIdsPool = new Set(users.map((u) => u.id));

      const guests = users.reduce((acum: GuestsDto[], user) => {
        if (userIdsPool.has(user.id)) {
          const currentPool = new Set(userIdsPool);
          currentPool.delete(user.id);

          const prevGuestId =
            user.lastMeeting?.firstGuest.id === user.id
              ? user.lastMeeting?.secondGuest.id
              : user.lastMeeting?.firstGuest.id;

          if (prevGuestId && currentPool.has(prevGuestId))
            currentPool.delete(prevGuestId);

          const newGuestIndex = Math.floor(
            Math.random() * (currentPool.size + 1)
          );

          const newGuestId = Array.from(currentPool)[newGuestIndex];

          if (newGuestId) {
            userIdsPool.delete(user.id);
            userIdsPool.delete(newGuestId);

            return [
              ...acum,
              { firstGuestId: user.id, secondGuestId: newGuestId },
            ];
          }
        }

        return acum;
      }, new Array<GuestsDto>());

      return { shuffledGuests: guests, guestsLeft: Array.from(userIdsPool) };
    }
  }

  export async function initBatch() {
    const { shuffledGuests, guestsLeft = [] } = (await shafleUserPairs()) ?? {};

    const lastBatch = await getLastBatch();
    if (lastBatch && !lastBatch?.executedAt) {
      await deleteBatch(lastBatch?.id);
    }

    if (shuffledGuests?.length) {
      const batches = await db
        .insert(meetingBatch)
        .values({})
        .returning()
        .execute();

      const currentBatch = batches[0];

      if (currentBatch?.id) {
        await Meeting.insert(currentBatch?.id, shuffledGuests);
      }
    }

    if (guestsLeft?.length) {
      await Settings.setSettingsByKey(
        NO_CONNECTION_USERS,
        JSON.stringify(guestsLeft)
      );
    }

    return { shuffledGuests, guestsLeft };
  }

  export async function getLastBatch(executed?: boolean) {
    const batches = await db
      .select()
      .from(meetingBatch)
      .where(
        executed
          ? isNotNull(meetingBatch.executedAt)
          : isNull(meetingBatch.executedAt)
      )
      .orderBy(desc(meetingBatch.createdAt))

      .limit(1)
      .execute();
    const currentBatch = batches[0];

    if (currentBatch?.id) {
      const meetings = await Meeting.getByBatchId(currentBatch.id);
      return { ...currentBatch, meetings: meetings ?? [] };
    }
  }

  export async function executeLastBatch(shedule?: number) {
    const currentBatch = await getLastBatch();

    if (currentBatch?.id && !currentBatch?.executedAt) {
      await db
        .update(meetingBatch)
        .set({
          ...currentBatch,
          executedAt: shedule ? new Date(shedule) : new Date(),
        })
        .where(eq(meetingBatch.id, currentBatch.id))
        .returning()
        .execute();

      const formattedUserIds = currentBatch.meetings.map(
        (m) => `${m.firstGuest.slackId}, ${m.secondGuest.slackId}`
      );

      return formattedUserIds;
    }
    return []
  }

  export async function deleteBatch(id: number) {
    return db.delete(meetingBatch).where(eq(meetingBatch.id, id)).execute();
  }
}
