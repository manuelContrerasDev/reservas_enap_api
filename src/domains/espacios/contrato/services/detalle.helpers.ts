// src/domains/espacios/contrato/services/detalle.helpers.ts
export function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function eachDay(desde: Date, hasta: Date) {
  const days: Date[] = [];
  const cur = new Date(desde);
  cur.setHours(0, 0, 0, 0);

  const end = new Date(hasta);
  end.setHours(0, 0, 0, 0);

  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function isMonday(d: Date) {
  return d.getDay() === 1;
}
