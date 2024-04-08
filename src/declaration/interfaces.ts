import {
  GlobalChannel,
  GlobalOnHoldReason,
  GlobalPriority,
  CSState,
  GlobalImpact,
  GlobalUrgency,
  INCState,
  PRBState, CHGRisk, CHGState
} from './enum.js'
import { IINCModify } from './types.js'

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
  holdReason: GlobalOnHoldReason
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
  state: INCState
  // on hold reason
  holdReason: GlobalOnHoldReason
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
  // ID of the user
  user: string
  // number of the incident
  number: string
  // field we are modifying
  field: string[]
  // the input
  input: IINCModify
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

export interface IPRBRequiredFieldInput {
  // display case number
  number: string
  // who is submitting this issue
  user: string
  // category
  category: string
  // channel in which submitted
  channel: GlobalChannel
  // impact
  impact: GlobalImpact
  // urgency
  urgency: GlobalUrgency
  // what's this about in a short description?
  statement: string
  // possibility a very long description of the issue (in markdown)
  description: string
}

export interface IPRBOptionalFieldInput {
  // initial report
  initialReport?: string
  // state
  state: PRBState
  // escalated or not
  escalated: boolean
  // asset assigned to case
  asset?: string[]
  // is there a change control created from this incident?
  change?: string[]
  // linked to a incident
  incident?: string[]
  // service effected
  service?: string
  // the offering possible from the selected service
  offering?: string
  // id of the user assigned the case
  assignedTo?: string
  // assignment group
  assignmentGroup?: string
  // tasks
  tasks?: string[]
  // kb
  kb?: string[]
}

export interface IPRBFields {
  required: IPRBRequiredFieldInput
  optional?: IPRBOptionalFieldInput
}

export interface ICHGRequiredFieldInput {
  // display case number
  number: string
  // who is submitting this change
  user: string
  // who is requester this change
  requester: string
  // category
  category: string
  // channel in which submitted
  channel: GlobalChannel
  // impact
  impact: GlobalImpact
  // urgency
  urgency: GlobalUrgency
  // risk
  risk: CHGRisk
  // what's this about in a short description?
  shortDescription: string
  // possibility a very long description of the issue (in markdown)
  description: string
}

export interface ICHGOptionalFieldInput {
  // state
  state: CHGState
  // escalated or not
  escalated: boolean
  // id of the user assigned the case
  assignedTo?: string
  // assignment group
  assignmentGroup?: string
  // id of the user assigned the case
  plannedStartDate?: string
  // assignment group
  plannedEndDate?: string
  // id of the user assigned the case
  actualStartDate?: string
  // assignment group
  actualEndDate?: string
  // id of the user assigned the case
  closedDate?: string
  // assignment group
  closedNotes?: string
  // assignment group
  closedBy?: string
}

export interface ICHGFields {
  required: ICHGRequiredFieldInput
  optional?: ICHGOptionalFieldInput
}

export interface ICHGModifyFieldInput {
  // who is submitting this change
  user: string
  // who is requester this change
  requester: string
  // category
  category: string
  // channel in which submitted
  channel: GlobalChannel
  // impact
  impact: GlobalImpact
  // urgency
  urgency: GlobalUrgency
  // risk
  risk: CHGRisk
  // what's this about in a short description?
  shortDescription: string
  // possibility a very long description of the issue (in markdown)
  description: string
  // state
  state: CHGState
  // escalated or not
  escalated: boolean
  // id of the user assigned the case
  assignedTo?: string
  // assignment group
  assignmentGroup?: string
  // id of the user assigned the case
  plannedStartDate?: string
  // assignment group
  plannedEndDate?: string
  // id of the user assigned the case
  actualStartDate?: string
  // assignment group
  actualEndDate?: string
  // id of the user assigned the case
  closedDate?: string
  // assignment group
  closedNotes?: string
  // assignment group
  closedBy?: string
}

export interface ICHGModifyFields {
  // ID of the user
  user: string
  // number of the incident
  number: string
  // field we are modifying
  field: string[]
  // the input
  input: ICHGModifyFieldInput
}