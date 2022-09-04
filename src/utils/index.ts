import { NextFunction, Request, Response } from "express";

export const second = 1e3;
export const minute = second * 60;
export const hour = minute * 60;
export const day = hour * 24;

export class KeepAlive {
  protected loop?: NodeJS.Timeout;

  constructor(protected callback: () => void, protected delay = 30 * 1e3) {}
  start() {
    this.loop = setInterval(this.callback, this.delay);
  }
  stop() {
    clearInterval(this.loop);
  }
  reset() {
    this.stop();
    this.start();
  }
}

export const sse = (_req: Request, res: Response, next: NextFunction) => {
  let message_count = 0;
  res.socket?.setTimeout(0);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.json = res.send = <T = any>(obj: T, type?: string): T => {
    res.write(`id: ${message_count}\n`);
    if (typeof type === "string") res.write(`event: ${type}\n`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = obj;

    try {
      data = JSON.stringify(data);
      // eslint-disable-next-line no-empty
    } catch {}

    res.write(`data: ${data}\n\n`);
    message_count += 1;
    return obj;
  };

  next();
};

export const regexEscape = (...args: string[]): string[] => {
  return args.map((_) => _.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));
};

export const timeCalc = (text: string) => {
  const timeWord = { s: second, m: minute, h: hour, d: day };

  Object.entries(timeWord).forEach(([key, value]) => {
    text = text.replace(key, `*${value}`);
  });

  return 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type sendSeeType<T = any> = (obj: T, type?: string) => T;
