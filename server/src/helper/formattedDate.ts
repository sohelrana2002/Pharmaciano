/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export const formattedDate = (date: any) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const formatted = dayjs(date)
    .tz("Asia/Dhaka")
    .format("DD-MMM-YYYY hh:mm:ss A");

  return formatted;
};
