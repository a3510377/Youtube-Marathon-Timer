import fs from "fs";
import { parseChat } from "../src/api";

const data = fs.readFileSync("./test/HK5.json", "utf8");
parseChat(
  {
    continuationContents: {
      liveChatContinuation: {
        actions: JSON.parse(data),
        continuations: [],
      },
    },
    responseContext: {},
  },
  {}
);
