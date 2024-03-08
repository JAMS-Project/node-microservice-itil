import { gql } from 'mercurius-codegen'

const schema = gql`

    enum CSChannel {
      SELFSERVE
      WEB
      PHONE
      AI
    }

    extend type Mutation {
      csCreate(number: String, channel: CSChannel, contact: String, priority: String, subject: String, description: String): Boolean
    }
          
    extend type Query {
      csQuery: Boolean
    }
`

export default schema
