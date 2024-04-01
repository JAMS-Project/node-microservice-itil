import { gql } from 'mercurius-codegen'
import schemaEnum from './schema/enum.js'
import schemaInput from './schema/input.js'
import schemaType from './schema/type.js'

const schema = schemaEnum + schemaInput + schemaType + gql`    
    extend type Mutation {
      # CS
      csCreate(number: String!, channel: GlobalChannel!, user: String!, priority: CSPriority, shortDescription: String!, description: String!, optional: CSModifyFields): createResult!
      csCreateNote(number: String!, channel: GlobalChannel!, user: String!, note: String!, type: String!): Boolean!
      csModifyField(number: String!, user: String!, field: [String!]!, input: CSModifyFields!): Boolean!
      # INC
      incCreate(required: INCRequiredFields, optional: INCOptionalFields): createResult!
      incCreateNote(number: String!, channel: GlobalChannel!, user: String!, note: String!, type: String!): Boolean!
      incModifyField(number: String!, user: String!, field: [String!]!, input: INCModifyFields!): Boolean!
      # PRB
      prbCreate(required: PRBRequiredFields, optional: PRBOptionalFields): createResult!
      prbCreateNote(number: String!, channel: PRBChannel!, user: String!, note: String!, type: String!): Boolean!
      prbModifyField(number: String!, user: String!, field: [String!]!, input: PRBModifyFields!): Boolean!
      # CHG
      chgCreate(required: CHGRequiredFields, optional: CHGOptionalFields): createResult!
      chgCreateNote(number: String!, channel: GlobalChannel!, user: String!, note: String!, type: String!): Boolean!
    }
          
    extend type Query {
      csQuery(number: String): [csQuery!]!
      incQuery(number: String): [incQuery!]!
      incCopy(number: String!): incCopy
      prbQuery(number: String): [prbQuery!]!
      chgQuery(number: String): [chgQuery!]!
    }
`

export default schema
