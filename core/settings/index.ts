import { eq } from "drizzle-orm";
import { db } from "../drizzle";

import { settings } from "./settings.sql";
import { LOGS_CHANNEL } from "./keys";

export module Settings {
  export async function getSettingsByKey(key: string) {
    return (
      await db.select().from(settings).where(eq(settings.key, key)).execute()
    )[0];
  }

  export async function setSettingsByKey(key: string, value: string) {
    const existedSettings = await getSettingsByKey(key);

    if (!existedSettings)
      return db.insert(settings).values({ key, value }).returning().execute();
    else
      return db
        .update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning()
        .execute();
  }

  export async function isAdminChannel(channelId: string) {
    const adminChannel = await getSettingsByKey(LOGS_CHANNEL);
    return channelId === adminChannel?.value;
  }
}
