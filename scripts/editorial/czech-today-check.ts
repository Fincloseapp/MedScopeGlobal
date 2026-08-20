import assert from "node:assert/strict";
import { easterSunday, getCzechTodayInfo } from "../../lib/calendar/czech-today";

const e2026 = easterSunday(2026);
assert.deepEqual(e2026, { month: 4, day: 5 });

const bernard = getCzechTodayInfo(new Date("2026-08-20T12:00:00+02:00"));
assert.match(bernard.dateLabel, /čtvrtek 20\. srpna 2026/i);
assert.equal(bernard.nameday, "Bernard");
assert.equal(bernard.holiday, null);
assert.match(bernard.text, /svátek má Bernard/);
assert.doesNotMatch(bernard.text, /crony|marketingové bloky/i);

const invasion = getCzechTodayInfo(new Date("2026-08-21T12:00:00+02:00"));
assert.equal(invasion.nameday, "Johana");
assert.match(invasion.text, /1968/);

const vaclav = getCzechTodayInfo(new Date("2026-09-28T12:00:00+02:00"));
assert.equal(vaclav.nameday, "Václav a Václava");
assert.match(vaclav.text, /státní svátek: Den české státnosti/);

const easterMonday = getCzechTodayInfo(new Date("2026-04-06T12:00:00+02:00"));
assert.match(easterMonday.text, /Velikonoční pondělí/);

const diabetes = getCzechTodayInfo(new Date("2026-11-14T12:00:00+01:00"));
assert.equal(diabetes.nameday, "Sáva");
assert.match(diabetes.text, /Světový den diabetu/);

const newYear = getCzechTodayInfo(new Date("2026-01-01T12:00:00+01:00"));
assert.equal(newYear.nameday, null);
assert.match(newYear.text, /státní svátek/);

console.log("czech-today-check ok");
console.log(getCzechTodayInfo().text);
