import { aliasedTable, desc, eq, or } from "drizzle-orm";
import { db } from "../drizzle";
import { GuestsDto, MeetingDto } from "./meeting.dto";
import { meeting } from "./meeting.sql";
import { user } from "../user/user.sql";

export module Meeting {
  const firstGuest = aliasedTable(user, "firstGuest");
  const secondGuest = aliasedTable(user, "secondGuest");

  export async function insert(meetingBatchId: number, guests: GuestsDto[]) {
    const meetingsDto = guests.map((g) => ({ meetingBatchId, ...g }));
    return db.insert(meeting).values(meetingsDto).returning().execute();
  }

  export async function list() {
    return db.select().from(meeting).execute();
  }

  export async function getByBatchId(meetingBatchId: number) {
    return db
      .select({
        id: meeting.id,
        meetingBatchId: meeting.meetingBatchId,
        createdAt: meeting.createdAt,
        firstGuest,
        secondGuest,
      })
      .from(meeting)
      .innerJoin(firstGuest, eq(firstGuest.id, meeting.firstGuestId))
      .innerJoin(secondGuest, eq(secondGuest.id, meeting.secondGuestId))
      .where(eq(meeting.meetingBatchId, meetingBatchId))
      .execute();
  }

  export async function getByUserId(userId: number) {
    return db
      .select({
        id: meeting.id,
        meetingBatchId: meeting.meetingBatchId,
        createdAt: meeting.createdAt,
        firstGuest,
        secondGuest,
      })
      .from(meeting)
      .where(
        or(eq(meeting.firstGuestId, userId), eq(meeting.secondGuestId, userId))
      )
      .innerJoin(firstGuest, eq(firstGuest.id, meeting.firstGuestId))
      .innerJoin(secondGuest, eq(secondGuest.id, meeting.secondGuestId))
      .orderBy(desc(meeting.createdAt))
      .limit(1)
      .execute();
  }
}
