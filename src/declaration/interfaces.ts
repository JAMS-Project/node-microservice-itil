import {CSChannel, CSOnHoldReason, CSPriority, CSState} from './enum.js'

export interface IMiscResult<T> {
  // setting name
  name: string
  // value
  value: T
}

export interface ICSCreateCase {
  // display case number
  number: string
  // channel in which submitted
  channel: CSChannel
  // who is submitting this issue
  contact: string
  // priority they have selected or assigned
  priority: CSPriority
  // asset assigned to case
  asset?: string
  // what's this about in a short description?
  shortDescription: string
  // possibility a very long description of the issue (in markdown)
  description: string
}

export interface ICSQuery {
  // display case number
  number: string
  // channel in which submitted
  channel: string
  // who is submitting this issue
  contact: string
  // priority they have selected or assigned
  priority: string
  // asset assigned to case
  asset?: string
  // what's this about in a short description?
  shortDescription: string
  // possibility a very long description of the issue (in markdown)
  description: string
}

export interface ICSCreateNote {
  // display case number
  number: string
  // display case number
  channel: CSChannel
  // display case number
  user: string
  // type
  type: 'note' | 'workNote'
  // display case number
  note: string
}

export interface ICSModifyFieldInput {
  // state
  state: CSState
  // on hold reason
  holdReason: CSOnHoldReason
  // channel
  channel: CSChannel
  // ID of the user
  user?: string
  // escalated or not
  escalated: boolean
  // asset assigned to case
  asset?: string
  // who is submitting this issue
  contact?: string
  // priority they have selected or assigned
  priority: CSPriority
  // id of the user assigned the case
  assignedTo?: string
  // assignment group
  assignmentGroup?: string
  // what's this about in a short description?
  shortDescription?: string
  // possibility a very long description of the issue (in markdown)
  description?: string
}

export interface ICSModifyField {
  // ID of the user
  user: string
  // display case number
  number: string
  // field we are modifying
  field: string[]
  // the input
  input: ICSModifyFieldInput
}