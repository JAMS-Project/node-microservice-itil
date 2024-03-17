import { gql } from 'mercurius-codegen'

const schemaInput = gql`
    input CSModifyFields {
      state: CSState
      holdReason: CSOnHoldReason
      channel: GlobalChannel
      user: String
      escalated: Boolean
      asset: String
      user: String
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
    
    
    
`

export default schemaInput