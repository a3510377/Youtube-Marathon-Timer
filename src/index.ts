import { fetchLivePage } from "youtube-chat/dist/requests";

process
  .on("uncaughtException", (er: Error) => console.error(er.toString()))
  .on("unhandledRejection", (er: Error) => console.error(er.toString()));

fetchLivePage;
/^https?:\/\/(www\.)?youtube\.com\/(?:channel\/(?<channelId>[^/]+)|watch\?v=(?<liveId>[^/]+))$/;
