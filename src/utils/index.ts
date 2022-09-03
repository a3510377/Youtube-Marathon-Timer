import { NextFunction, Request, Response } from "express";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type sendSeeType<T = any> = (obj: T, type?: string) => T;
