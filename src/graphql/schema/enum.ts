import { gql } from 'mercurius-codegen'

const schemaEnum = gql`
    enum GlobalChannel {
      SELF_SERVE,
      WEB,
      PHONE,
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
 `

export default schemaEnum