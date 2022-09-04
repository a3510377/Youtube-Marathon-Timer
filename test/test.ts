import fs from "fs";
import { parseChat } from "../src/api";

const data = fs.readFileSync("./test/test.json", "utf8");
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
).then(console.log);
