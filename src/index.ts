import "./server";
import { LiveChat } from "./api";
import { addTime } from "./server";
import { IDUrl, interval, MembershipLevel, Proportion } from "./config";

process
  .on("uncaughtException", (er: Error) => console.error(er))
  .on("unhandledRejection", (er: Error) => console.error(er));

const chat = new LiveChat(IDUrl, interval);

chat
  .on("chat", (data) => {
    console.log(
      `${data.author.name} > ${data.message
        .map((_) => "text" in _ && _.text)
        .join("")}`
    );
  })
  .on("newMembership", ({ MembershipType }) => {
    if (!MembershipType) return;

    console.log("新的會員:", MembershipType);

    addTime(`+:${MembershipLevel?.[MembershipType] || 0}`);
  })
  .on("newPaidMessage", ({ currency, amountValue, baseAmountValue }) => {
    // 我懶所以多寫 if 一次不過沒差
    if (!baseAmountValue) return;

    console.log(
      "新的超級訊息:",
      `${currency ? currency + " " : ""}${amountValue} ->`,
      baseAmountValue
    );

    addTime(`+:${baseAmountValue * Proportion}`);
  });
