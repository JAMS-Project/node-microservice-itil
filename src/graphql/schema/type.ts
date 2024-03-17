import { gql } from 'mercurius-codegen'

const schemaType = gql`
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
      
    type incQuery {
      number: String!
      channel: Int!
      user: String!
      category: String!
      impact: Int!
      urgency: Int!
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
    
    type incCopy {
      number: String!
      channel: Int!
      user: String!
      category: String!
      impact: Int!
      urgency: Int!
      shortDescription: String!
      description: String!
    }
`

export default schemaType