import { PaymentFrequency } from "@prisma/client";

interface ScheduleEntry {
  amount: number;
  dueDate: Date;
}

const MONTHS_PER_PERIOD: Record<PaymentFrequency, number> = {
  ONE_TIME: 0,
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12,
};

function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function buildPaymentSchedule(
  startDate: Date,
  endDate: Date,
  premiumAmount: number,
  frequency: PaymentFrequency
): ScheduleEntry[] {
  if (frequency === "ONE_TIME") {
    return [{ amount: premiumAmount, dueDate: startDate }];
  }

  const monthsPerPeriod = MONTHS_PER_PERIOD[frequency];
  const totalMonths = Math.max(monthsBetween(startDate, endDate), monthsPerPeriod);
  const periods = Math.max(Math.round(totalMonths / monthsPerPeriod), 1);

  const baseAmount = Math.floor((premiumAmount / periods) * 100) / 100;
  const remainder = Math.round((premiumAmount - baseAmount * periods) * 100) / 100;

  return Array.from({ length: periods }, (_, index) => ({
    amount: index === periods - 1 ? Math.round((baseAmount + remainder) * 100) / 100 : baseAmount,
    dueDate: addMonths(startDate, index * monthsPerPeriod),
  }));
}
