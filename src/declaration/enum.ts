export enum GlobalChannel {
  SELF_SERVE,
  WEB,
  PHONE,
  AI
}

export enum GlobalPriority {
  LOW,
  MODERATE,
  HIGH,
  CRITICAL
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

export enum GlobalOnHoldReason {
  UNSET,
  INFO,
  VENDOR,
  RE_ASSIGNMENT,
  PENDING_SCHEDULED,
  SCHEDULED,
  DEPENDENCY
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

export enum INCState {
  NEW,
  IN_PROGRESS,
  ON_HOLD,
  RESOLVED,
  CLOSED
}

export enum PRBState {
  NEW,
  ASSESS,
  RCA,
  FIX_IN_PROGRESS,
  RESOLVED,
  CLOSED
}

export enum PRBChannel {
  MANUAL,
  AUTO,
  AI
}

export enum CHGState {
  NEW,
  APPROVAL_WAITING,
  APPROVAL_CAB,
  APPROVAL_REJECTED,
  SCHEDULED,
  ON_HOLD,
  IN_PROGRESS,
  REVIEW,
  CLOSED,
  CANCELLED
}

export enum CHGRisk {
  LOW,
  MODERATE,
  HIGH,
  CRITICAL
}
