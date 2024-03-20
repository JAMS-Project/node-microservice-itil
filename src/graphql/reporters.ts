import { csCreate } from './mutation/csCreate.js'
import { csCreateNote } from './mutation/csCreateNote.js'
import { csModifyField } from './mutation/csModifyField.js'
import { incCreate } from './mutation/incCreate.js'
import { incCreateNote } from './mutation/incCreateNote.js'
import {incModifyField} from "./mutation/incModifyField.js";
import {prbCreate} from "./mutation/prbCreate.js";
import {prbCreateNote} from "./mutation/prbCreateNote.js";
import {prbModifyField} from "./mutation/prbModifyField.js";
import { csQuery } from './query/csQuery.js'
import {incCopy} from "./query/incCopy.js";
import { incQuery } from './query/incQuery.js'
import {prbQuery} from "./query/prbQuery";

const Mutation = {
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
  prbQuery
}

const Types = {}

export const resolvers = { Mutation, Query, ...Types }
