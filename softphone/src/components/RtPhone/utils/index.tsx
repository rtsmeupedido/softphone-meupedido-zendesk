import axios from "axios";

export const numbers = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "0",
  "#",
];

const ZDK_URL = import.meta.env.ZDK_URL;
const ZDK_TOKEN = import.meta.env.ZDK_TOKEN;

export const getTicket = async (ticketId: number) => {
  return await axios
    .get(`${ZDK_URL}tickets/${ticketId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${ZDK_TOKEN}`,
      },
    })
    .then(({ data }: { data: { ticket: any } }) => {
      return data.ticket;
    })
    .catch(() => {
      return [];
    });
};
