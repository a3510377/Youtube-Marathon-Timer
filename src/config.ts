// 1 min =   30元
// 10 min =  300元
// 30 min =  900元，轉一次轉盤
// 60 min = 1500元，轉一次2倍轉盤，可反悔一次
// 120 min = 3000元，轉一次4倍轉盤，可反悔二次
// 180 min = 4500元，轉一次6倍轉盤，可反悔三次

import { regexEscape } from "./utils";

const t = {
  白銀臥胡: 2.5,
  黃金臥胡: 10,
  鉑金臥胡: 25,
  鑽石臥胡: 65,
  傳說臥胡: 130,
};

const t2 = new RegExp(`.*(${regexEscape(...Object.keys(t)).join("|")}).*`);
console.log(t2);
