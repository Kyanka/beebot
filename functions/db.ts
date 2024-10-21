import { Hono } from "hono";
import { User } from "../core/user";

const app = new Hono();

app.get("/users", async (ctx) => {
  const users = await User.list();

  return ctx.json(users);
});

export default app;
