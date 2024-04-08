import { gql } from 'mercurius-codegen'

const schemaType = gql`
    type createResult {
      number: String
      result: Boolean!
    }

    type csQuery { 
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
      # This will be required in the future since this will calculated by the system
      priority: Int
      shortDescription: String!
      description: String!
      state: Int!
      holdReason: Int
      escalated: Boolean!
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
    
    type prbQuery {
      number: String!
      user: String!
      category: String!
      channel: Int!
      impact: Int!
      urgency: Int!
      # This will be required in the future since this will calculated by the system
      priority: Int
      statement: String!
      description: String!
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
    
    type chgQuery {
      # Required
      number: String!
      user: String!
      requester: String!
      category: String!
      channel: Int!
      impact: Int!
      urgency: Int!
      risk: Int!
      # This will be required in the future since this will calculated by the system
      priority: Int
      shortDescription: String!
      description: String!
      # Optional      
      state: Int
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

export default schemaType
