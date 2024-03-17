import { csCreate } from './mutation/csCreate.js'
import { csCreateNote } from './mutation/csCreateNote.js'
import { csModifyField } from './mutation/csModifyField.js'
import { incCreate } from './mutation/incCreate.js'
import { incCreateNote } from './mutation/incCreateNote.js'
import { csQuery } from './query/csQuery.js'
import { incQuery } from './query/incQuery.js'

const Mutation = {
  csCreate,
  csCreateNote,
  csModifyField,
  incCreate,
  incCreateNote
}

const Query = {
  csQuery,
  incQuery
}

const Types = {}

export const resolvers = { Mutation, Query, ...Types }
