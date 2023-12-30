#! /usr/bin/env node
import axios from "axios";
import ora from "ora";
import yargs from "yargs";
import inquirer from "inquirer";
import { Clinics as rawClinics } from "./clinics.js";
const Clinics = rawClinics.map((c) => ({ macabi_id: c.macabi_id, label: c.label.split("").reverse().join("") }));
const DefaultNumOfDays = 14;
const DefaultClinicIndex = 32;
const MaccabiUrl = "https://maccabi-dent.com/%D7%AA%D7%95%D7%A8-%D7%9C%D7%9C%D7%90-%D7%A1%D7%99%D7%A1%D7%9E%D7%90/";
let { clinic, numOfDays } = await yargs(process.argv.slice(2))
    .usage("Usage: npx maccabi-toothy-tooth [-c <number>][-d <number>]")
    .options({
    clinic: {
        alias: "c",
        number: true,
        demandOption: false,
        choices: rawClinics.map((c) => Number(c.macabi_id)),
        description: "Maccabi clinic id",
        nargs: 1,
    },
    numOfDays: {
        alias: "n",
        number: true,
        description: "Number of days to limit the search for.",
        nargs: 1,
        demandOption: false,
    },
})
    .check((argv) => {
    if (argv.numOfDays !== undefined && argv.numOfDays < 1) {
        throw new Error('"numOfDays" must be greater or equal to 1');
    }
    return true;
})
    .example("npx maccabi-toothy-tooth -c 37 -d 14", "Get appointments in Tel-Aviv for the next 14 days.")
    .example("npx maccabi-toothy-tooth", "Prompt user for city and number of days.")
    .help("h")
    .alias("h", "help")
    .epilog("Daniel Schwartz Inc. 2024").argv;
(async () => {
    // Prompt user if missing args:
    const { numOfDays: inputNumOfDays, clinic: inputClinic } = await getUserInput({
        getClinic: !clinic,
        getNumOfDays: !numOfDays,
    });
    clinic ||= inputClinic;
    numOfDays ||= inputNumOfDays;
    // Fetch appointments:
    const spinner = (console.log(""), ora("Fetching").start());
    const { lines: appointments } = await fetchAppointments(clinic);
    // Filter:
    const dates = filterDatesOfInterest(appointments, numOfDays);
    spinner.succeed(dates.length ? "Cool, got something:" : "Done, sorry no available appointments.");
    // Print:
    printDateAppointments(dates);
})();
async function getUserInput({ getClinic = true, getNumOfDays = true, } = {}) {
    if (!getClinic && !getNumOfDays)
        return {};
    const choices = Clinics.map((c) => c.label);
    const choicesMap = Clinics.reduce((acc, item) => ({ ...acc, [item.label]: item.macabi_id }), {});
    const prompts = [
        getClinic
            ? {
                type: "list",
                name: "clinic",
                message: "I want an appointment at",
                choices,
                filter(label) {
                    return Number(choicesMap[label]);
                },
                default() {
                    return DefaultClinicIndex;
                },
            }
            : undefined,
        getNumOfDays
            ? {
                type: "number",
                name: "numOfDays",
                message: "I want an appointment in the following number of days:",
                default() {
                    return DefaultNumOfDays;
                },
            }
            : undefined,
    ].filter(Boolean);
    const answers = await inquirer.prompt(prompts);
    return answers;
}
async function fetchAppointments(clinic) {
    const { data } = await axios.post("https://maccabi-dent.com/wp-admin/admin-ajax.php", new URLSearchParams({
        action: "get_lines",
        "data[macabi_id]": clinic.toString(),
        "data[service_type]": "hygenist",
        "data[age]": "A",
        paged: "1",
        selecteddoc: "",
        getnearby: "true",
        updateminicalander: "true",
        specificdate: "",
        bday: "1985-05-17",
        show_video: "",
    }), {
        headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Cookie: "MDLUEGSEVIPE=qov4qf4it9o6ff96gt3r1lbmcd; _gcl_au=1.1.1844840286.1667995881; _fbp=fb.1.1667995893993.1112138398; bioep_shown_session=true; bioep_shown=true; _gid=GA1.2.956866342.1668689449; popup-927108=1; show-data-popup=1; TS01ccdba7=0139ab6fd01e418a6137e004dec3720d40bc70244f5b8a5298710c9bbe845ffa0dec3dc8358802c7e84187b2131952ca223b1f6828; _gat=1; _gat_UA-2350924-2=1; TS00000000076=08cd0ab03dab280091ccc1fcff4f8d69f3cee9fe6ecb0150f79443bf21a083f82a1d04c7b4faa52fe7b654ade611c5c50869ebde3409d000295cf1b780b9b2c8d005998f6c7f3d99cc44d7136c0246d84aebfe2ea34fbd7249c486e544babd0eef599c451c8532ffd440c822b416a10d31150f173adf6327f74eee24d917aed8bdf52933e6091f28e4d600f303988e05519764bd58e93975f1f7d924e0c948032b74d2a734e92b5ea178c0fd3ab2132fda08d3adcae0c9c50ebc4b7914a848836d40225117a1704b926a10c53430a87acf5a8a422f32fc9062acecc58e748a0995cf8e317bc81cccda9e2dbc61bd71daf62728338231789136898bc12a75e5a0f7d8021af49af775; TSPD_101_DID=08cd0ab03dab280091ccc1fcff4f8d69f3cee9fe6ecb0150f79443bf21a083f82a1d04c7b4faa52fe7b654ade611c5c50869ebde340638003167fc4b6eb18c7c875f263a3ff15e0de469622b2e8a10dc4b6866779b8d4180c4cb9435187ba52860ec2c90e300bb3ac5be5de89d3bf737; _ga_VBKKCMQ0S9=GS1.1.1668710491.11.1.1668710500.51.0.0; _ga=GA1.2.716158364.1667995884; TS82a59902029=08cd0ab03dab2800b0c4eb9a8bd0e44d16683602022ed41a2fb62536c52657f15c12b898d02120983270a481376c8464; TS16ca2245027=08cd0ab03dab200059faecb68b8c6fa2cc7376560f1256f940a42ea365b55087001c8fe64b64f40708685513f611300030475eba6a0131c250f455cbb21ebc85da27dab9fc09bf52f237ca678a2dd5a4531c61b603f0ecfbb4cb9fc71838d538",
            Origin: "https://maccabi-dent.com",
            Pragma: "no-cache",
            Referer: "https://maccabi-dent.com/%d7%aa%d7%95%d7%a8-%d7%9c%d7%9c%d7%90-%d7%a1%d7%99%d7%a1%d7%9e%d7%90/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "sec-ch-ua": '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
        },
    });
    return data;
}
function filterDatesOfInterest(lines, numOfDays) {
    const limit = Date.now() + numOfDays * 24 * 60 * 60 * 1000;
    const interestingEntries = Object.entries(lines).filter(([epochSecStr]) => Number(epochSecStr) * 1000 <= limit);
    const result = interestingEntries.map(([epochSecStr, dateLine]) => ({
        dateLine,
        date: new Date(Number(epochSecStr) * 1000),
    }));
    return result;
}
function printDateAppointments(dates) {
    for (const { date, dateLine } of dates) {
        console.log("\n🦷", date.toDateString());
        const times = Object.values(dateLine).map(({ time, lines }) => ({
            time,
            clinic: prettyHebrewStr(lines?.[0]?.["clinic_name"]),
            doctor: prettyHebrewStr(lines?.[0]?.["doctor_name"]),
        }));
        console.table(times);
    }
    if (dates.length) {
        console.log(`\nFor scheduling go to: ${MaccabiUrl}`);
    }
}
function prettyHebrewStr(str) {
    const htmlDecoded = decodeEntities(str);
    return htmlDecoded.split("").reverse().join("");
}
function decodeEntities(encodedString) {
    const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
        nbsp: " ",
        amp: "&",
        quot: '"',
        lt: "<",
        gt: ">",
    };
    return encodedString
        .replace(translate_re, function (match, entity) {
        return translate[entity];
    })
        .replace(/&#(\d+);/gi, function (match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}
