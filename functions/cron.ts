import moment from "moment";
import { Settings } from "../core/settings";
import {
  CONNECTION_DAY,
  CONNECTION_TIME,
  REGULAR_CONNECTION,
} from "../core/settings/keys";
import { Slack } from "../core/slack";
import { WEEKDAY } from "../core/utils/constants";

export async function handler() {
  console.log("CRON HANDLER");
  const date = new Date();
  const dayOfWeek = date.getDay();
  const conectionDay = await Settings.getSettingsByKey(CONNECTION_DAY);
  const connectionTime = await Settings.getSettingsByKey(CONNECTION_TIME);
  const regularConnection = await Settings.getSettingsByKey(REGULAR_CONNECTION);

  if (conectionDay?.value === WEEKDAY[dayOfWeek] && regularConnection) {
    console.log("CONNECTION TIME");
    await Slack.Commands.makeUserConnections(connectionTime?.value);
  } else {
    console.log("NOT CONNECTION TIME");
  }
}
