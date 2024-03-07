import * as gql from 'gql-query-builder'

export default (variables?: object) => gql.mutation({
  operation: 'csCreate',
  variables
})