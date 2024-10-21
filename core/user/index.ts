import { inArray } from "drizzle-orm";
import { db } from "../drizzle";
import { UserType, UserDto } from "./user.dto";
import { user } from "./user.sql";
import { Meeting } from "../meeting";
import { Settings } from "../settings";
import { NO_CONNECTION_USERS } from "../settings/keys";

export module User {
  export async function list() {
    return db.select().from(user).execute();
  }

  export async function getUserListByIds(ids: number[]) {
    return db.select().from(user).where(inArray(user.id, ids)).execute();
  }

  export async function getUserListByEmails(emails: string[]) {
    return db.select().from(user).where(inArray(user.email, emails)).execute();
  }

  export async function getUserListByNames(names: string[]) {
    return db.select().from(user).where(inArray(user.name, names)).execute();
  }

  export async function insertUserList(usersDto: UserDto[]) {
    return db.insert(user).values(usersDto).onConflictDoNothing();
  }

  export async function getUserWithLastMeeting(user: UserType) {
    const meetings = await Meeting.getByUserId(user.id);

    return { ...user, lastMeeting: meetings[0] };
  }

  export async function getUserListWithLastMeetings() {
    const users = await list();

    const usersWithMeetingPromises = users.map((user) =>
      getUserWithLastMeeting(user)
    );

    return Promise.all(usersWithMeetingPromises);
  }

  export async function getUnpairedUserEmail() {
    const notPairedUsers = (
      await Settings.getSettingsByKey(NO_CONNECTION_USERS)
    )?.value;

    if (notPairedUsers) {
      const users = await User.getUserListByIds(
        JSON.parse(notPairedUsers) as number[]
      );

      const userEmailsMessage = users.map((u) => u.email).join(", ");

      return userEmailsMessage;
    }
  }
}
