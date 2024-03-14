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
    
    enum INCPriority {
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
      asset: String
      contact: Int!
      priority: Int!
      assignedTo: String!
      assignmentGroup: String!
      shortDescription: String!
      description: String!
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

    extend type Mutation {
      csCreate(number: String!, channel: GlobalChannel!, user: String!, priority: CSPriority, asset: String, shortDescription: String!, description: String!): Boolean!
      csCreateNote(number: String!, channel: GlobalChannel!, user: String!, note: String!, type: String!): Boolean!
      csModifyField(number: String!, user: String!, field: [String!]!, input: CSModifyFields!): Boolean
    }
          
    extend type Query {
      csQuery(number: String): [csQuery!]!
    }
`

export default schema
