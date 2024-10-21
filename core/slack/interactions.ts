import { Settings } from "../settings";
import {
  CONNECTION_DAY,
  CONNECTION_TIME,
  REGULAR_CONNECTION,
} from "../settings/keys";
import {
  DAY_TIME_SELECT_BLOCKS,
  SUCCESSFULL_TIME_BLOCKS,
} from "../utils/constants";
import { DAY_TIME_SELECT_ACTION, WEEK_DAY_SELECT_ACTION } from "./actions";

export module Interactions {
  export async function weekDaySelect(
    responseUrl: string,
    selectedOption: string
  ) {
    const settingsKey = await Settings.setSettingsByKey(
      CONNECTION_DAY,
      selectedOption
    );

    if (settingsKey?.length) {
      await fetch(responseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Day is selected",
          blocks: DAY_TIME_SELECT_BLOCKS,
          replace_original: true,
        }),
      });
    }
  }

  export async function dayTimeSelect(
    responseUrl: string,
    selectedTime: string
  ) {
    const connectionKey = await Settings.setSettingsByKey(
      CONNECTION_TIME,
      selectedTime
    );

    const regularConnection = await Settings.setSettingsByKey(
      REGULAR_CONNECTION,
      "true"
    );

    if (connectionKey?.length && regularConnection?.length) {
      await fetch(responseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Time is selected",
          blocks: SUCCESSFULL_TIME_BLOCKS,
          replace_original: true,
        }),
      });
    }
  }

  export async function reduceInteractions(
    selectedActionId: string,
    responseUrl: string,
    payload: any
  ) {
    switch (selectedActionId) {
      case WEEK_DAY_SELECT_ACTION: {
        const selectedOption = payload?.selected_option;
        return weekDaySelect(responseUrl, selectedOption.value);
      }
      case DAY_TIME_SELECT_ACTION: {
        dayTimeSelect(responseUrl, payload.selected_time);
      }
    }
  }
}
