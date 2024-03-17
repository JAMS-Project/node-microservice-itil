import { gql } from 'mercurius-codegen'

const schema = gql`

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
    
    type csQuery { 
      id: ID!
      number: String!
      state: Int!
      holdReason: Int
      dateCreated: String!
      channel: Int!
      user: String!
      escalated: Boolean!
      activityLog: String!
      asset: String
      contact: Int!
      priority: Int!
      assignedTo: String!
      assignmentGroup: String!
      shortDescription: String!
      description: String!
      resolveDate: String
      resolveNotes: String
      resolvedBy: String
    }
   
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
    
    input INCModifyFields {
      state: Int
      holdReason: Int
      channel: Int
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
    
    type incQuery {
      number: String!
      channel: GlobalChannel!
      user: String!
      category: String!
      impact: GlobalImpact!
      urgency: GlobalUrgency!
      shortDescription: String!
      description: String!
      state: Int!
      holdReason: Int
      channel: Int!
      escalated: Boolean!
      asset: String
      category: String!
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
 
    extend type Mutation {
      # CS
      csCreate(number: String!, channel: GlobalChannel!, user: String!, priority: CSPriority, shortDescription: String!, description: String!, optional: CSModifyFields): Boolean!
      csCreateNote(number: String!, channel: GlobalChannel!, user: String!, note: String!, type: String!): Boolean!
      csModifyField(number: String!, user: String!, field: [String!]!, input: CSModifyFields!): Boolean!
      # INC
      incCreate(required: INCRequiredFields, optional: INCModifyFields): Boolean!
      incCreateNote(number: String!, channel: GlobalChannel!, user: String!, note: String!, type: String!): Boolean!
    }
          
    extend type Query {
      csQuery(number: String): [csQuery!]!
      incQuery(number: String): [incQuery!]!
    }
`

export default schema
