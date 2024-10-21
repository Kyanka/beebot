import { text, pgTable } from "drizzle-orm/pg-core";
import { id, timestamps } from "../utils/sql";

export const user = pgTable("user", {
  ...id,
  ...timestamps,
  slackId: text("slack_id").unique().notNull(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
});
