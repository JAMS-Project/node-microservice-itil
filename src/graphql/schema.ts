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

    extend type Mutation {
      csCreate(number: String!, channel: CSChannel!, contact: String!, priority: CSPriority, asset: String, shortDescription: String!, description: String!): Boolean
    }
          
    extend type Query {
      csQuery: Boolean
    }
`

export default schema
