import { gql } from 'mercurius-codegen'

const schema = gql`
    extend type Mutation {
      csCreate: Boolean
    }
          
    extend type Query {
      csQuery: Boolean
    }
`

export default schema
