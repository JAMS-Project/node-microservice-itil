export enum GlobalPriority {
  LOW,
  MODERATE,
  HIGH,
  CRITICAL
}

export enum GlobalChannel {
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
  UNSET,
  INFO,
  VENDOR,
  RE_ASSIGNMENT,
  PENDING_SCHEDULED,
  SCHEDULED,
  DEPENDENCY
}

export enum INCState {
  NEW,
  IN_PROGRESS,
  ON_HOLD,
  RESOLVED,
  CLOSED
}

export enum GlobalImpact {
  LOW,
  MODERATE,
  HIGH,
  CRITICAL
}

export enum GlobalUrgency {
  LOW,
  MODERATE,
  HIGH,
  CRITICAL
}
