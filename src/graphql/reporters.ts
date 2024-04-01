import { chgCreate } from './mutation/chgCreate.js'
import {chgCreateNote} from "./mutation/chgCreateNote";
import { csCreate } from './mutation/csCreate.js'
import { csCreateNote } from './mutation/csCreateNote.js'
import { csModifyField } from './mutation/csModifyField.js'
import { incCreate } from './mutation/incCreate.js'
import { incCreateNote } from './mutation/incCreateNote.js'
import { incModifyField } from './mutation/incModifyField.js'
import { prbCreate } from './mutation/prbCreate.js'
import { prbCreateNote } from './mutation/prbCreateNote.js'
import { prbModifyField } from './mutation/prbModifyField.js'
import {chgQuery} from "./query/chgQuery";
import { csQuery } from './query/csQuery.js'
import { incCopy } from './query/incCopy.js'
import { incQuery } from './query/incQuery.js'
import { prbQuery } from './query/prbQuery.js'

const Mutation = {
  chgCreate,
  chgCreateNote,
  csCreate,
  csCreateNote,
  csModifyField,
  incCreate,
  incCreateNote,
  incModifyField,
  prbCreate,
  prbCreateNote,
  prbModifyField
}

const Query = {
  csQuery,
  incCopy,
  incQuery,
  prbQuery,
  chgQuery
}

const Types = {}

export const resolvers = { Mutation, Query, ...Types }
