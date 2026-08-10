export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameCalendarDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export function formatDate(date, options = {}) {
  return new Date(date).toLocaleDateString("it-IT", options);
}

export function isValidTimeSlot(time) {
  if (!/^\d{2}:\d{2}$/.test(time || "")) return false;
  const [hour, minute] = time.split(":").map(Number);
  return hour >= 7 && hour <= 18 && minute % 15 === 0 && !(hour === 18 && minute > 0);
}

export function getTimeSlots() {
  const slots = [];

  for (let hour = 7; hour <= 18; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 0) break;
      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }

  return slots;
}
