import * as gql from 'gql-query-builder'

export default (operation: string, variables?: object) => gql.mutation({
  operation, variables
})