import { Hono } from "hono";
import slack from "./slack";
import db from "./db";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.route("/slack", slack);
app.route("/db", db);

export const handler = handle(app);
