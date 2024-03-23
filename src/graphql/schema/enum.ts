import { gql } from 'mercurius-codegen'

const schemaEnum = gql`
    enum GlobalChannel {
      SELF_SERVE,
      WEB,
      PHONE,
      AI
    }
    
    enum PRBChannel {
      MANUAL,
      AUTO,
      AI
    }

    enum CSPriority {
      LOW,
      MODERATE,
      HIGH,
      CRITICAL
    }
    
    enum GlobalImpact {
      LOW,
      MODERATE,
      HIGH,
      CRITICAL
    }
    
    enum GlobalUrgency {
      LOW,
      MODERATE,
      HIGH,
      CRITICAL
    }
    
    enum CHGRisk {
      LOW,
      MODERATE,
      HIGH,
      CRITICAL
    }
    
    enum CSState {
      NEW,
      IN_PROGRESS,
      RESOLVED,
      ON_HOLD,
      SOLUTION_PROPOSED,
      SOLUTION_REJECTED,
      CLOSED
    }
    
    enum CSOnHoldReason {
      UNSET,
      INFO,
      VENDOR,
      RE_ASSIGNMENT,
      PENDING_SCHEDULED,
      SCHEDULED,
      DEPENDENCY
    }
    
    enum INCState {
      NEW,
      IN_PROGRESS,
      RESOLVED,
      ON_HOLD,
      CLOSED
    }
    
    enum INCOnHoldReason {
      UNSET,
      INFO,
      VENDOR,
      RE_ASSIGNMENT,
      PENDING_SCHEDULED,
      SCHEDULED,
      DEPENDENCY
    }
    
    enum PRBState {
      NEW,
      ASSESS,
      RCA,
      FIX_IN_PROGRESS,
      RESOLVED,
      CLOSED
    }
    
    enum CHGState {
      NEW,
      # Access
      APPROVAL_WAITING,
      # Access
      APPROVAL_CAB,
      APPROVAL_REJECTED,
      SCHEDULED,
      ON_HOLD,
      IN_PROGRESS,
      REVIEW,
      CLOSED,
      CANCELLED
    }

 `

export default schemaEnum
