export function toDateOnly(d) {
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function startOfDayKey(d) {
  return toDateOnly(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function startOfWeekKey(d) {
  const day = d.getDay(); // 0 sun
  const diff = d.getDate() - day; // start on Sunday
  const start = new Date(d);
  start.setDate(diff);
  return toDateOnly(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
}
