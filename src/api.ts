import axios from "axios";
import EventEmitter from "events";
import { fetchLivePage } from "youtube-chat/dist/requests";
import type {
  FetchOptions,
  GetLiveChatResponse,
} from "youtube-chat/dist/types/yt-response";

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

export class LiveChat extends EventEmitter {
  public liveId?: string;
  protected observer?: NodeJS.Timer;
  protected options?: FetchOptions;

  public constructor(url: string, protected readonly interval = 1000) {
    super();
  }

  public async start(): Promise<boolean> {
    if (this.observer) return false;

    try {
      // TODO
      const options = await fetchLivePage({ liveId: "" });
      this.liveId = options.liveId;
      this.options = options;

      this.observer = setInterval(this.execute.bind(this), this.interval);

      this.emit("start", this.liveId);
      return true;
    } catch (err) {
      this.emit("error", err);
      return false;
    }
  }

  public stop(reason?: string) {
    if (!this.observer) return;

    clearInterval(this.observer);
    this.observer = void 0;
    this.emit("end", reason);
  }

  public async execute() {
    if (!this.options) {
      const message = "Not found options";
      this.emit("error", new Error(message));
      this.stop(message);

      return;
    }

    // try {
    //   const [chatItems, continuation] = await fetchChat(this.#options);
    //   chatItems.forEach((chatItem) => this.emit("chat", chatItem));

    //   this.#options.continuation = continuation;
    // } catch (err) {
    //   this.emit("error", err);
    // }
  }

  protected async getChat(options: FetchOptions) {
    const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`;

    const data = await axios
      .post(url, {
        context: {
          client: { clientVersion: options.clientVersion, clientName: "WEB" },
        },
        continuation: options.continuation,
      })
      .then(({ data }): GetLiveChatResponse => data);

    data.continuationContents.liveChatContinuation.continuations;
  }
}
