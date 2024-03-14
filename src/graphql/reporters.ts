import { csCreate } from './mutation/csCreate.js'
import { csCreateNote } from './mutation/csCreateNote.js'
import {csModifyField} from "./mutation/csModifyField.js";
import {incCreate} from "./mutation/incCreate.js";
import { csQuery } from './query/csQuery.js'

const Mutation = {
  csCreate,
  csCreateNote,
  csModifyField,
  incCreate
}

const Query = {
  csQuery
}

const Types = {}

export const resolvers = { Mutation, Query, ...Types }
