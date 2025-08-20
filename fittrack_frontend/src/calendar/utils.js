//
// PUBLIC_INTERFACE
// Utility functions for calendar view: date helpers and data aggregation for workouts and meals.
//
/** Convert a Date to yyyy-mm-dd string */
export function toDateOnly(d) {
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Return a new Date at start of day local time */
export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Return the first day (Sunday) of the week for a given date */
export function startOfWeek(d) {
  const day = d.getDay(); // 0 Sun..6 Sat
  const s = new Date(d);
  s.setDate(d.getDate() - day);
  return startOfDay(s);
}

/** Return the first day of month */
export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Return the number of days in month */
export function daysInMonth(year, monthIndex /* 0-11 */) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Build a 6x7 grid (weeks x days) for a given month (including spillover days). */
export function buildMonthGrid(year, monthIndex) {
  const first = startOfMonth(new Date(year, monthIndex, 1));
  const firstWeekStart = startOfWeek(first);
  const grid = [];
  let cur = new Date(firstWeekStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    grid.push(week);
  }
  return grid;
}

/** Aggregates workouts and meals by date key yyyy-mm-dd */
export function aggregateEntriesByDate({ sessions = [], meals = [] }) {
  const map = new Map();
  const add = (key, type, item) => {
    if (!map.has(key)) map.set(key, { workouts: [], meals: [] });
    map.get(key)[type].push(item);
  };
  sessions.forEach((s) => {
    const key = toDateOnly(new Date(s.date));
    add(key, 'workouts', s);
  });
  meals.forEach((m) => {
    const key = toDateOnly(new Date(m.dateTime));
    add(key, 'meals', m);
  });
  return map;
}

/** Returns short weekday labels starting Sunday */
export function weekdayShort() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
