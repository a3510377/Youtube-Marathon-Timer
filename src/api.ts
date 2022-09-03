import axios from "axios";
import { FetchOptions } from "youtube-chat/dist/types/yt-response";

export const getChat = async (options: FetchOptions) => {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`;
  await axios.post(url, {
    context: {
      client: {
        clientVersion: options.clientVersion,
        clientName: "WEB",
      },
    },
    continuation: options.continuation,
  });
};
