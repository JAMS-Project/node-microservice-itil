import { gql } from 'mercurius-codegen'

const schemaInput = gql`
    input CSModifyFields {
      state: CSState
      holdReason: CSOnHoldReason
      channel: GlobalChannel
      user: String
      escalated: Boolean
      asset: String
      priority: CSPriority
      assignedTo: String
      assignmentGroup: String
      shortDescription: String
      description: String
    }
    
    input INCRequiredFields {
      number: String!
      channel: GlobalChannel!
      user: String!
      category: String!
      impact: GlobalImpact!
      urgency: GlobalUrgency!
      shortDescription: String!
      description: String!
    }
    
    input INCOptionalFields {
      state: Int
      holdReason: INCOnHoldReason
      channel: GlobalChannel
      escalated: Boolean
      asset: String
      category: String
      subCategory: String
      problem: String
      change: String
      changeCaused: String
      service: String
      offering: String
      assignedTo: String
      assignmentGroup: String 
      parent: String
      child: [String!]
    }
    
    input INCModifyFields {
      channel: GlobalChannel
      user: String
      category: String
      impact: GlobalImpact
      urgency: GlobalUrgency
      shortDescription: String
      description: String
      state: INCState
      holdReason: INCOnHoldReason
      escalated: Boolean
      asset: String
      subCategory: String
      problem: String
      change: String
      changeCaused: String
      service: String
      offering: String
      assignedTo: String
      assignmentGroup: String 
      parent: String
      child: [String!]
    }
    
    input PRBRequiredFields {
      number: String!
      user: String!
      category: String!
      channel: PRBChannel!
      impact: GlobalImpact!
      urgency: GlobalUrgency!
      statement: String!
      description: String!
    }
    
    input PRBOptionalFields {
      initialReport: String
      state: Int
      escalated: Boolean
      asset: [String!]
      change: [String!]
      incident: [String!]
      service: String
      offering: String
      assignedTo: String
      assignmentGroup: String 
      # Tasks will be items that needed to be done for compiling this problem.
      tasks: [String]
      # KB Articles
      kb: [String!]
    }
    
    input PRBModifyFields {
      category: String
      channel: PRBChannel
      impact: GlobalImpact
      urgency: GlobalUrgency
      statement: String
      description: String
      initialReport: String
      state: PRBState
      escalated: Boolean
      asset: [String!]
      change: [String!]
      incident: [String!]
      service: String
      offering: String
      assignedTo: String
      assignmentGroup: String 
      # Tasks will be items that needed to be done for compiling this problem.
      tasks: [String]
      # KB Articles
      kb: [String!]
    }
    
    input CHGRequiredFields {
      number: String!
      user: String!
      requester: String!
      category: String!
      channel: GlobalChannel!
      impact: GlobalImpact!
      urgency: GlobalUrgency!
      risk: CHGRisk!
      shortDescription: String!
      description: String!
    }
    
    input CHGOptionalFields {
      state: Int
      escalated: Boolean
      assignmentGroup: String
      assignedTo: String
      plannedStartDate: String
      plannedEndDate: String
      actualStartDate: String
      actualEndDate: String
    }
    
    input CHGModifyFields {
      user: String
      requester: String
      category: String
      channel: GlobalChannel
      impact: GlobalImpact
      urgency: GlobalUrgency
      risk: CHGRisk
      shortDescription: String
      description: String
      state: CHGState
      escalated: Boolean
      assignmentGroup: String
      assignedTo: String
      plannedStartDate: String
      plannedEndDate: String
      actualStartDate: String
      actualEndDate: String
      closedDate: String
      closedNotes: String
      closedBy: String
    }
    
    
`

export default schemaInput
