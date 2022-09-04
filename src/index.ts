import "./server";
import { LiveChat } from "./api";
import { addTime } from "./server";
import { interval, MembershipLevel, Proportion } from "./config";

process
  .on("uncaughtException", (er: Error) => console.error(er.toString()))
  .on("unhandledRejection", (er: Error) => console.error(er.toString()));

const chat = new LiveChat(
  "https://www.youtube.com/channel/UC9YOQFPfEUXbulKDtxeqqBA",
  interval
);

chat
  .on("chat", (data) => {
    console.log(
      `${data.author.name} > ${data.message
        .map((_) => "text" in _ && _.text)
        .join("")}`
    );
  })
  .on("newMembership", (data) => {
    // 我懶所以多寫 if 一次不過沒差
    console.log(data);
    addTime(`+:${MembershipLevel?.[data.MembershipType] || 0}`);
  })
  .on("newPaidMessage", (data) => {
    console.log(data);

    data.baseAmountValue && addTime(`+:${data.baseAmountValue * Proportion}`);
  });
