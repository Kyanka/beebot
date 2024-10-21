import { text, pgTable } from "drizzle-orm/pg-core";
import { id, timestamps } from "../utils/sql";

export const settings = pgTable("settings", {
  ...id,
  ...timestamps,
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
});
