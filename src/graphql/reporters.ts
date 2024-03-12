import { csCreate } from './mutation/csCreate.js'
import { csCreateNote } from './mutation/csCreateNote.js'
import { csQuery } from './query/csQuery.js'

const Mutation = {
  csCreate,
  csCreateNote
}

const Query = {
  csQuery
}

const Types = {}

export const resolvers = { Mutation, Query, ...Types }
