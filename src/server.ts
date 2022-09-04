import fs from "fs";
import path from "path";

import cors from "cors";
import express from "express";
import { EventEmitter } from "events";
import bodyParse from "body-parser";

import { KeepAlive, sse, sendSeeType } from "./utils";

const publicDir = path.join(__dirname, "..", "public");

const server = express();
const event = new EventEmitter();

let lave = new Date();
let stopTime: Date | undefined = void 0;

try {
  const tmp = fs.readFileSync("tmp", "utf8");
  let lave_;

  [, lave_, stopTime] = (
    tmp.match(/([0-9]+)(?:;stop=([0-9]+|undefined)?;?)/) || []
  ).map((_) => (!Number.isNaN(+_) && new Date(+_)) || void 0);

  lave = lave_ || lave;
  console.log(lave_?.getTime(), lave.getTime(), stopTime);
} catch {
  fs.writeFileSync("tmp", lave.getTime().toString());
}
const updateTmpFile = () => {
  fs.writeFileSync(
    "tmp",
    lave.getTime().toString() + `;stop=${stopTime?.getTime()}`
  );
};

event
  .on("update", updateTmpFile)
  .on("stop", updateTmpFile)
  .on("continue", () => {
    if (!stopTime) return;

    lave.setTime(
      lave.getTime() + (new Date().getTime() - new Date(stopTime).getTime())
    );

    updateTmpFile();
    stopTime = void 0;
  });

server
  .use(bodyParse.urlencoded({ extended: true }))
  .use(bodyParse.text())
  .use(bodyParse.json())
  .use(cors())
  .get("/", (_req, res) => {
    res.sendFile(path.join(publicDir, "config.html"));
  })
  .post("/", (req, res) => {
    const data: string = req.body;

    const [mark, time] = data.split(":");
    console.log(mark, time);

    if (mark === "+") lave.setTime(lave.getTime() + +time);
    else if (mark === "-") lave.setTime(lave.getTime() - +time);
    else if (mark === "stop" && !stopTime) {
      stopTime = new Date();
      event.emit("stop", stopTime);
    } else if (mark === "continue") stopTime && event.emit("continue");

    event.emit("update", lave);
    res.sendStatus(200);
  })
  .get(
    "/time",
    (req, res, next) => {
      if (req.accepts("html")) {
        res.sendFile(path.join(publicDir, "time.html"));
      } else next();
    },
    sse,
    (_req, res_) => {
      const res = <typeof res_ & { json: sendSeeType; send: sendSeeType }>res_;
      const keepAlive = new KeepAlive(() => res.json("", "ping"));

      const sendNewTime = (time?: Date) => {
        res.send((time || lave).getTime().toString(), "update");
      };
      const sendStop = (time?: Date) => res.send(time, "stop");
      const sendContinue = () => res.send("", "continue");

      res.setHeader("Access-Control-Allow-Origin", "*");
      keepAlive.start();
      sendNewTime();

      event
        .on("update", sendNewTime)
        .on("stop", sendStop)
        .on("continue", sendContinue);

      res.on("close", () => {
        keepAlive.stop();
        event
          .removeListener("update", sendNewTime)
          .removeListener("stop", sendStop)
          .removeListener("continue", sendContinue);
      });
    }
  );

server.listen(process.env.PORT || 5090, () => {
  console.log("Server is running");
});
