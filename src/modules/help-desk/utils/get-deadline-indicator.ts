import { DeadlineIndicator, TicketStatus } from "@modules/help-desk/enums/ticket-status";

const DUE_SOON_THRESHOLD_HOURS = 24;

const CLOSED_STATUSES = [TicketStatus.ENCERRADO, TicketStatus.CANCELADO];

export function getDeadlineIndicator(
  status: TicketStatus,
  deadlineDate: Date,
  now: Date = new Date(),
): DeadlineIndicator {
  if (CLOSED_STATUSES.includes(status)) {
    return DeadlineIndicator.ON_TIME;
  }

  const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeadline < 0) {
    return DeadlineIndicator.OVERDUE;
  }

  if (hoursUntilDeadline <= DUE_SOON_THRESHOLD_HOURS) {
    return DeadlineIndicator.DUE_SOON;
  }

  return DeadlineIndicator.NEUTRAL;
}
