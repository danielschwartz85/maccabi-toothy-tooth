#! /usr/bin/env node
import axios from "axios";
import { Maccabi } from "./interfaces";
import ora from "ora";

const DaysAhead = process.env.MC_LIMIT_DAYS ? Number(process.env.MC_LIMIT_DAYS) : 14;

(async () => {
  const spinner = ora("Fetching").start();
  const { lines } = await fetcAppontements();
  spinner.succeed(lines.length ? "Cool, got something:" : "Done, sorry no avaialbe appontenets.");
  const dates = filterInterstingDates(lines);
  spinner.succeed(dates.length ? "Cool, got something:" : "Done, sorry no avaialbe appointements.");
  printDateLine(dates);
})();

async function fetcAppontements(): Promise<Maccabi.Response> {
  const { data } = await axios.post<Maccabi.Response>(
    "https://maccabi-dent.com/wp-admin/admin-ajax.php",
    new URLSearchParams({
      action: "get_lines",
      "data[macabi_id]": "37",
      "data[service_type]": "hygenist",
      "data[age]": "A",
      paged: "1",
      selecteddoc: "",
      getnearby: "true",
      updateminicalander: "true",
      specificdate: "",
      bday: "1985-05-17",
      show_video: "",
    }),
    {
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie:
          "MDLUEGSEVIPE=qov4qf4it9o6ff96gt3r1lbmcd; _gcl_au=1.1.1844840286.1667995881; _fbp=fb.1.1667995893993.1112138398; bioep_shown_session=true; bioep_shown=true; _gid=GA1.2.956866342.1668689449; popup-927108=1; show-data-popup=1; TS01ccdba7=0139ab6fd01e418a6137e004dec3720d40bc70244f5b8a5298710c9bbe845ffa0dec3dc8358802c7e84187b2131952ca223b1f6828; _gat=1; _gat_UA-2350924-2=1; TS00000000076=08cd0ab03dab280091ccc1fcff4f8d69f3cee9fe6ecb0150f79443bf21a083f82a1d04c7b4faa52fe7b654ade611c5c50869ebde3409d000295cf1b780b9b2c8d005998f6c7f3d99cc44d7136c0246d84aebfe2ea34fbd7249c486e544babd0eef599c451c8532ffd440c822b416a10d31150f173adf6327f74eee24d917aed8bdf52933e6091f28e4d600f303988e05519764bd58e93975f1f7d924e0c948032b74d2a734e92b5ea178c0fd3ab2132fda08d3adcae0c9c50ebc4b7914a848836d40225117a1704b926a10c53430a87acf5a8a422f32fc9062acecc58e748a0995cf8e317bc81cccda9e2dbc61bd71daf62728338231789136898bc12a75e5a0f7d8021af49af775; TSPD_101_DID=08cd0ab03dab280091ccc1fcff4f8d69f3cee9fe6ecb0150f79443bf21a083f82a1d04c7b4faa52fe7b654ade611c5c50869ebde340638003167fc4b6eb18c7c875f263a3ff15e0de469622b2e8a10dc4b6866779b8d4180c4cb9435187ba52860ec2c90e300bb3ac5be5de89d3bf737; _ga_VBKKCMQ0S9=GS1.1.1668710491.11.1.1668710500.51.0.0; _ga=GA1.2.716158364.1667995884; TS82a59902029=08cd0ab03dab2800b0c4eb9a8bd0e44d16683602022ed41a2fb62536c52657f15c12b898d02120983270a481376c8464; TS16ca2245027=08cd0ab03dab200059faecb68b8c6fa2cc7376560f1256f940a42ea365b55087001c8fe64b64f40708685513f611300030475eba6a0131c250f455cbb21ebc85da27dab9fc09bf52f237ca678a2dd5a4531c61b603f0ecfbb4cb9fc71838d538",
        Origin: "https://maccabi-dent.com",
        Pragma: "no-cache",
        Referer: "https://maccabi-dent.com/%d7%aa%d7%95%d7%a8-%d7%9c%d7%9c%d7%90-%d7%a1%d7%99%d7%a1%d7%9e%d7%90/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    }
  );
  return data;
}

function filterInterstingDates(lines: Maccabi.Dates): { dateLine: Maccabi.DateLine; date: Date }[] {
  const limit = Date.now() + DaysAhead * 24 * 60 * 60 * 1000;
  const intrestingEntries = Object.entries(lines).filter(([epochSecStr]) => Number(epochSecStr) * 1000 <= limit);
  const result = intrestingEntries.map(([epochSecStr, dateLine]) => ({
    dateLine,
    date: new Date(Number(epochSecStr) * 1000),
  }));
  return result;
}

function printDateLine(dates: { dateLine: Maccabi.DateLine; date: Date }[]) {
  for (const { date, dateLine } of dates) {
    console.log("\n🦷", date.toDateString());
    const times = Object.values(dateLine).map(({ time, lines }) => ({
      time,
      clinic: prettyHebrewStr(lines?.[0]?.["clinic_name"]),
      doctor: prettyHebrewStr(lines?.[0]?.["doctor_name"]),
    }));
    console.table(times);
  }
}

function prettyHebrewStr(str: string): string {
  const htmlDecoded = decodeEntities(str);
  return htmlDecoded.split("").reverse().join("");
}

function decodeEntities(encodedString: string): string {
  const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  const translate = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    lt: "<",
    gt: ">",
  };
  return encodedString
    .replace(translate_re, function (match: unknown, entity: keyof typeof translate): string {
      return translate[entity];
    })
    .replace(/&#(\d+);/gi, function (match: unknown, numStr: string): string {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
}
