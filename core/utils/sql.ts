import { serial, timestamp } from "drizzle-orm/pg-core";

export const id = {
  id: serial("id").primaryKey(),
};

export const timestamps = {
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
};
