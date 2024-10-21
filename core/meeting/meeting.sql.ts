import { pgTable, integer } from "drizzle-orm/pg-core";
import { id, timestamps } from "../utils/sql";
import { meetingBatch } from "../meeting-batch/meeting-batch.sql";
import { user } from "../user/user.sql";

export const meeting = pgTable("meeting", {
  ...id,
  ...timestamps,
  meetingBatchId: integer("meeting_batch_id")
    .notNull()
    .references(() => meetingBatch.id, { onDelete: "cascade" }),
  firstGuestId: integer("first_guest_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  secondGuestId: integer("second_guest_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
