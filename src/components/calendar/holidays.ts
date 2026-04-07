import { format } from "date-fns";

// Static US holidays - easily extendable
const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "New Year's",
  "02-14": "Valentine's",
  "07-04": "Independence",
  "10-31": "Halloween",
  "12-25": "Christmas",
  "12-31": "New Year's Eve",
};

// Simple dynamic holidays (approximate)
function getUSHolidays(year: number): Record<string, string> {
  const holidays: Record<string, string> = {};

  for (const [mmdd, name] of Object.entries(FIXED_HOLIDAYS)) {
    holidays[`${year}-${mmdd}`] = name;
  }

  // MLK Day: 3rd Monday of January
  const jan1 = new Date(year, 0, 1);
  const mlkDay = new Date(year, 0, 1 + ((1 - jan1.getDay() + 7) % 7) + 14);
  holidays[format(mlkDay, "yyyy-MM-dd")] = "MLK Day";

  // Memorial Day: Last Monday of May
  const may31 = new Date(year, 4, 31);
  const memDay = new Date(year, 4, 31 - ((may31.getDay() + 6) % 7));
  holidays[format(memDay, "yyyy-MM-dd")] = "Memorial";

  // Labor Day: 1st Monday of September
  const sep1 = new Date(year, 8, 1);
  const laborDay = new Date(year, 8, 1 + ((1 - sep1.getDay() + 7) % 7));
  holidays[format(laborDay, "yyyy-MM-dd")] = "Labor Day";

  // Thanksgiving: 4th Thursday of November
  const nov1 = new Date(year, 10, 1);
  const thanksgiving = new Date(year, 10, 1 + ((4 - nov1.getDay() + 7) % 7) + 21);
  holidays[format(thanksgiving, "yyyy-MM-dd")] = "Thanksgiving";

  return holidays;
}

const cache = new Map<number, Record<string, string>>();

export function getHolidayForDate(date: Date): string | undefined {
  const year = date.getFullYear();
  if (!cache.has(year)) {
    cache.set(year, getUSHolidays(year));
  }
  return cache.get(year)![format(date, "yyyy-MM-dd")];
}
