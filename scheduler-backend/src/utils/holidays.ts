import Holidays from "date-holidays";

export function getPEIHolidays(year: number) {
  const hd = new Holidays("CA", "PE"); // Canada → Prince Edward Island
  const list = hd.getHolidays(year);

  return list.map(h => ({
    name: h.name,
    date: new Date(h.date),
  }));
}