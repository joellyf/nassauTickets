export function localDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Recife",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    date: `${values.year}-${values.month}-${values.day}`,
    yyMMdd: `${String(values.year).slice(-2)}${values.month}${values.day}`,
  };
}

export function isBusinessHours(date = new Date()) {
  if (process.env.ALLOW_AFTER_HOURS === "true") {
    return true;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Recife",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const minutes = hour * 60 + minute;
  return minutes >= 7 * 60 && minutes < 17 * 60;
}
