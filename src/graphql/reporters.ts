import { csCreate } from './mutation/csCreate.js'
import { csQuery } from './query/csQuery.js'

const Mutation = {
  csCreate
}

const Query = {
  csQuery
}

const Types = {}

export const resolvers = { Mutation, Query, ...Types }
