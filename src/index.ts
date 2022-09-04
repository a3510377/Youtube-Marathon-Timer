import { fetchLivePage } from "youtube-chat/dist/requests";

import "./server";
import { LiveChat } from "./api";

process
  .on("uncaughtException", (er: Error) => console.error(er.toString()))
  .on("unhandledRejection", (er: Error) => console.error(er.toString()));

fetchLivePage;
// new LiveChat("https://www.youtube.com/channel/UC9YOQFPfEUXbulKDtxeqqBA");
