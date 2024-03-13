export enum CSPriority {
  LOW,
  MODERATE,
  HIGH,
  CRITICAL
}

export enum CSChannel {
  SELF_SERVE,
  WEB,
  PHONE,
  AI
}

export enum CSState {
  NEW,
  IN_PROGRESS,
  RESOLVED,
  ON_HOLD,
  SOLUTION_PROPOSED,
  SOLUTION_REJECTED,
  CLOSED
}

export enum CSOnHoldReason {
  UNSET= -1,
  INFO,
  VENDOR,
  RE_ASSIGNMENT,
  PENDING_SCHEDULED,
  SCHEDULED,
  DEPENDENCY
}
