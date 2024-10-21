import { pgTable, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "../utils/sql";

export const meetingBatch = pgTable("meeting_batch", {
  ...id,
  ...timestamps,
  executedAt: timestamp("executed_at", {
    mode: "date",
    withTimezone: true, 
  }),
});
