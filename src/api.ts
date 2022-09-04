import fs from "fs";

import axios from "axios";
import EventEmitter from "events";
import { fetchLivePage } from "youtube-chat/dist/requests";
import type {
  FetchOptions,
  GetLiveChatResponse,
} from "youtube-chat/dist/types/yt-response";

import { AREA, day, MembershipLevel, MembershipLevelRegex } from "./config";
import { AreaToCurrency } from "./utils/data";

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
  protected oneData?: boolean;
  protected exchange?: Record<string, number>;

  public constructor(url: string, protected readonly interval = 1000) {
    super();

    const [, channelId, liveId] =
      url.match(
        /^https?:\/\/(?:www\.)?youtube\.com\/(?:channel\/([^/]+)|watch\?v=([^/]+))$/
      ) || [];

    this.start(channelId ? { channelId } : { liveId });

    const updateExchangeRates = async () => {
      const {
        data: { rates },
      } = await axios.get(`https://api.exchangerate.host/latest?base=${AREA}`);
      this.exchange = <typeof this.exchange>rates;
    };
    setInterval(updateExchangeRates.bind(this), day);
    updateExchangeRates();
  }

  public async start(
    id: { channelId: string } | { liveId: string }
  ): Promise<boolean> {
    if (this.observer) return false;

    try {
      // TODO
      const options = await fetchLivePage(id);
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

    const data = await this.getChat(this.options);
    this.oneData ||= true;
    this.options.continuation = data.continuation;
    //   chatItems.forEach((chatItem) => this.emit("chat", chatItem));

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

    return parseChat(
      await axios
        .post(url, {
          context: {
            client: { clientVersion: options.clientVersion, clientName: "WEB" },
          },
          continuation: options.continuation,
        })
        .then(({ data }): GetLiveChatResponse => data),
      this.exchange || {}
    );
  }
}

export const parseChat = async (
  data: GetLiveChatResponse,
  exchange: Record<string, number>
) => {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

  const {
    data: { rates },
  } = await axios.get(`https://api.exchangerate.host/latest?base=${AREA}`);
  exchange = <typeof exchange>rates;
  /* continuation */
  // const [continuationData] =
  //   data.continuationContents.liveChatContinuation.continuations;

  // const continuation =
  //   continuationData.invalidationContinuationData?.continuation ??
  //   continuationData.timedContinuationData?.continuation ??
  //   "";
  const continuation = "";
  // console.log(
  //   JSON.stringify(data.continuationContents.liveChatContinuation.actions)
  // );

  /* MembershipMessage */
  const MembershipMessage =
    data.continuationContents.liveChatContinuation.actions?.[0].addChatItemAction?.item.liveChatMembershipItemRenderer?.headerSubtext.runs
      .map((_) => "text" in _ && _.text)
      .join("");

  const [, MembershipType] =
    MembershipMessage?.match(MembershipLevelRegex) || [];

  console.log(MembershipType, MembershipLevel?.[MembershipType]);

  /* ChatPaidMessage */
  const ChatPaidMessage =
    data.continuationContents.liveChatContinuation.actions?.[0]
      .addChatItemAction?.item.liveChatPaidMessageRenderer?.purchaseAmountText
      .simpleText;
  const [, area, count] =
    ChatPaidMessage?.replace("$", "").match(/([a-zA-Z-_]+?) *([0-9.]+)/) || [];
  console.log(
    ChatPaidMessage?.replace("$", "").match(/([a-zA-Z-_]+?) *([0-9.]+)/),
    JSON.stringify(
      data.continuationContents.liveChatContinuation.actions?.[0]
        .addChatItemAction?.item
    )
  );

  console.log(+count / (exchange?.[AreaToCurrency?.[area] || area] || 1));

  return { continuation };
};
