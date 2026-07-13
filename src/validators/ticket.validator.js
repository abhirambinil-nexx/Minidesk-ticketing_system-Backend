import { z } from "zod";

const VALID_TRANSITIONS = {
  open: ["in_progress"],

  in_progress: ["resolved", "open"],

  resolved: ["closed", "reopened"],

  reopened: ["in_progress"],

  closed: [], // terminal
};

export function assertValidTransition(fromStatus, toStatus, userRole) {
  if (fromStatus === toStatus) return;

  if (
    toStatus === "reopened" &&
    userRole !== "requester" &&
    userRole !== "admin"
  ) {
    throw new Error(
      "Only the requester or an admin can reopen a resolved ticket.",
    );
  }

  const allowed = VALID_TRANSITIONS[fromStatus] || [];

  if (!allowed.includes(toStatus)) {
    throw new Error(`Invalid status transition: ${fromStatus} → ${toStatus}`);
  }
}

export const updateTicketSchema = z.object({
  title: z.string().min(1).optional(),

  description: z.string().optional(),

  status: z
    .enum(["open", "in_progress", "resolved", "closed", "reopened"])
    .optional(),

  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

  category: z.string().nullable().optional(),

  assigneeId: z.number().int().nullable().optional(),

  startDate: z.union([z.string(), z.null()]).optional(),

  dueDate: z.union([z.string(), z.null()]).optional(),
});
