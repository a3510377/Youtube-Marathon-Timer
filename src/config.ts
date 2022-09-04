import { regexEscape } from "./utils";

export const second = 1e3;
export const minute = second * 60;
export const hour = minute * 60;
export const day = hour * 24;

/**間隔獲取最新訊息 (ms) */
export const interval = 1000;

/**匯率換算使用
 * @see https://api.exchangerate.host/latest
 */
export const AREA = "TWD";

/**超級留言每元添加加班時間比
 * ex: 1元 = 1分鐘, 2元 = 2分鐘
 */
export const Proportion = 1 * minute;

/**加入會員添加加班時間
 * ex: 白銀臥胡 = 2.5分鐘
 */
export const MembershipLevel: Record<string, number> = {
  白銀臥胡: 2.5 * minute,
  黃金臥胡: 10 * minute,
  鉑金臥胡: 25 * minute,
  鑽石臥胡: 65 * minute,
  傳說臥胡: 130 * minute,
};

export const MembershipLevelRegex = new RegExp(
  `.*(${regexEscape(...Object.keys(MembershipLevel)).join("|")}).*`
);
