import { GlobalChannel, CSOnHoldReason, GlobalPriority, CSState, GlobalImpact, GlobalUrgency } from './enum.js'

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
  channel: GlobalChannel
  // who is submitting this issue
  contact: string
  // priority they have selected or assigned
  priority: GlobalPriority
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

export interface ICSModifyFieldInput {
  // state
  state: CSState
  // on hold reason
  holdReason: CSOnHoldReason
  // channel
  channel: GlobalChannel
  // ID of the user
  user?: string
  // escalated or not
  escalated: boolean
  // asset assigned to case
  asset?: string
  // who is submitting this issue
  contact?: string
  // priority they have selected or assigned
  priority: GlobalPriority
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

export interface IINCRequiredFieldInput {
  // display case number
  number: string
  // channel in which submitted
  channel: GlobalChannel
  // category
  category: string
  // impact
  impact: GlobalImpact
  // urgency
  urgency: GlobalUrgency
  // who is submitting this issue
  user: string
  // what's this about in a short description?
  shortDescription: string
  // possibility a very long description of the issue (in markdown)
  description: string
}

export interface IINCOptionalFieldInput {
  // state
  state?: number
  // on hold reason
  holdReason?: number
  // channel
  channel: number
  // escalated or not
  escalated: boolean
  // asset assigned to case
  asset?: string
  // category
  category?: string
  // possible sub category from category
  subCategory?: string
  // linked to a problem
  problem?: string
  // is there a change control created from this incident?
  change?: string
  // is there a change control that caused this incident?
  changeCaused?: string
  // service effected
  service?: string
  // the offering possible from the selected service
  offering?: string
  // id of the user assigned the case
  assignedTo?: string
  // assignment group
  assignmentGroup?: string
  // child
  child?: string[]
  // parent
  parent?: string
}

export interface IINCFields {
  required: IINCRequiredFieldInput
  optional?: IINCOptionalFieldInput
}

export interface IINCModifyFields {
  number: string
  required: IINCRequiredFieldInput
  optional?: IINCOptionalFieldInput
}

export interface ICreateNote {
  // display case number
  number: string
  // display case number
  channel: GlobalChannel
  // display case number
  user: string
  // type
  type: 'note' | 'workNote'
  // display case number
  note: string
}
