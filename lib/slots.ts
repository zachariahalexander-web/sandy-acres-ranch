export const SLOTS_PER_DAY = 12;
const START_HOUR = 8;

export function slotLabel(slotIndex: number): string {
  const startHour = START_HOUR + slotIndex;
  const format = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${period}`;
  };
  return `${format(startHour)} - ${format(startHour + 1)}`;
}

export const SLOT_INDICES = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i);
