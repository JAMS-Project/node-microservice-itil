import {CSChannel, CSPriority} from "./enum";

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