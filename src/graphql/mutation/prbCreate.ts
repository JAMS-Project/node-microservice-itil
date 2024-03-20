import {GlobalChannel, GlobalImpact, GlobalUrgency, PRBChannel, PRBState } from '../../declaration/enum.js'
import {IPRBFields, IPRBOptionalFieldInput} from "../../declaration/interfaces";

export const prbCreate = async (parent: any, args: IPRBFields, context: any): Promise<{ number?: string, result: boolean}> => {
  const { required, optional: inputOptional } = args

  // first, lets check to make sure that the number isn't already used
  const result = await context.app.mongo.db.collection('prbItems').countDocuments({ number: required.number })
  if (result > 0) {
    throw new Error('Number already being used. Unable to submit.')
  }

  const getDefaults = await context.app.mongo.db.collection('prbDefaults').find().toArray()
  const outputObject: { [key: string]: string | number | boolean } = {}
  getDefaults.forEach((item: { name: string, value: string | number | boolean }): void => {
    outputObject[item.name] = item.value
  })

  const optional: IPRBOptionalFieldInput = {
    asset: [],
    assignedTo: "",
    assignmentGroup: "",
    change: [],
    escalated: false,
    incident: [],
    initialReport: "",
    kb: [],
    offering: "",
    service: "",
    state: 0,
    tasks: []
  }
  Object.assign(optional, outputObject, inputOptional)

  const currentDateTime = new Date()

  const { insertedId: id } = await context.app.mongo.db.collection('prbItems').insertOne({
    ...required,
    ...optional,
    channel: GlobalChannel[required.channel],
    impact: GlobalImpact[required.impact],
    urgency: GlobalUrgency[required.urgency]
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.inc.create" action to look at the payload

  context.app.log.debug(id.toString(), 'PRB: MAIN ID')

  await context.app.mongo.db.collection('prbActivityLog').insertOne({
    date: currentDateTime,
    fields: {
      ...required,
      ...optional,
      channel: PRBChannel[required.channel],
      state: PRBState[optional?.state],
      impact: GlobalImpact[required.impact],
      urgency: GlobalUrgency[required.urgency]
    },
    ref: id,
    type: 'field',
    user: required.user,
    system: false
  })

  return { number: required.number, result: true}
}
