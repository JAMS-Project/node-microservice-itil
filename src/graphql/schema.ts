import { gql } from 'mercurius-codegen'

const schema = gql`

    enum CSPriority {
      LOW
      MODERATE
      HIGH
      CRITICAL
    }

    enum CSChannel {
      SELFSERVE
      WEB
      PHONE
      AI
    }
    
    type csQuery { 
      id: ID!
      number: String!
      state: Int!
      holdReason: String!
      dateCreated: String!
      channel: String!
      user: String!
      escalated: Boolean!
      asset: String
      contact: String!
      priority: String!
      assignedTo: String!
      assignmentGroup: String!
      shortDescription: String!
      description: String!
    }

    extend type Mutation {
      csCreate(number: String!, channel: CSChannel!, contact: String!, priority: CSPriority, asset: String, shortDescription: String!, description: String!): Boolean
    }
          
    extend type Query {
      csQuery(number: String): [csQuery!]!
    }
`

export default schema
