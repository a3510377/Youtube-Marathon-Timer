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

try {
  lave = new Date(+fs.readFileSync("tmp", "utf8"));
} catch {
  fs.writeFileSync("tmp", lave.toString());
}
event.on("update", () => fs.writeFileSync("tmp", lave.getTime().toString()));

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
    console.log(lave.getTime() + +time);
    console.log(mark, time);

    if (mark === "+") lave.setTime(lave.getTime() + +time);
    else if (mark === "-") lave.setTime(lave.getTime() - +time);

    event.emit("update", lave);
    res.send();
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
      const keepAlive = new KeepAlive(() => res.json({}, "ping"));

      const sendNewTime = (time?: Date) => {
        res.send((time || lave).getTime().toString(), "update");
      };

      res.setHeader("Access-Control-Allow-Origin", "*");
      keepAlive.start();
      sendNewTime();
      event.on("update", sendNewTime);

      res.on("close", () => {
        keepAlive.stop();
        event.removeListener("update", sendNewTime);
      });
    }
  );

server.listen(process.env.PORT || 5090, () => {
  console.log("Server is running");
});
