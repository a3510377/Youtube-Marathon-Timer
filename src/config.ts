// 1 min =   30元
// 10 min =  300元
// 30 min =  900元，轉一次轉盤
// 60 min = 1500元，轉一次2倍轉盤，可反悔一次
// 120 min = 3000元，轉一次4倍轉盤，可反悔二次
// 180 min = 4500元，轉一次6倍轉盤，可反悔三次
// 以此類推，每筆贊助最多反悔三次

// 加入白銀臥胡(  75元) = 2.5 min
// 加入黃金臥胡( 300元) =  10 min
// 加入鉑金臥胡( 750元) =  25 min
// 加入鑽石臥胡(1600元) =  65 min，轉一次2倍轉盤，可反悔一次
// 加入傳說臥胡(3200元) = 130 min，轉一次4倍轉盤，可反悔二次

import { regexEscape } from "./utils";

export const second = 1e3;
export const minute = second * 60;
export const hour = minute * 60;
export const day = hour * 24;

/**匯率換算使用 */
export const AREA = "TWD";

export const PaidMessage = {
  "30": 1 * minute,
  "300": 10 * minute,
  "900": 30 * minute,
  "1500": 60 * minute,
  "3000": 120 * minute,
  "4500": 180 * minute,
};

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
