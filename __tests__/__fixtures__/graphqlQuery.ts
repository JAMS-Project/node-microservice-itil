import * as gql from 'gql-query-builder'

export default (operation: string, fields?: any[], variables?: object) => gql.query({
  operation, fields, variables
})