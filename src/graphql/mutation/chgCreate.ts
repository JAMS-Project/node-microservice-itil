import {
  CHGRisk,
  CHGState,
  GlobalChannel,
  GlobalImpact,
  GlobalUrgency
} from '../../declaration/enum.js'
import { ICHGFields, ICHGOptionalFieldInput } from '../../declaration/interfaces.js'

export const chgCreate = async (parent: any, args: ICHGFields, context: any): Promise<{ number?: string, result: boolean }> => {
  const { required, optional: inputOptional } = args

  // first, lets check to make sure that the number isn't already used
  const result = await context.app.mongo.db.collection('chgItems').countDocuments({ number: required.number })
  if (result > 0) {
    throw new Error('Number already being used. Unable to submit.')
  }

  const getDefaults = await context.app.mongo.db.collection('chgDefaults').find().toArray()
  const outputObject: { [key: string]: string | number | boolean } = {}
  getDefaults.forEach((item: { name: string, value: string | number | boolean }): void => {
    outputObject[item.name] = item.value
  })

  const optional: ICHGOptionalFieldInput = {
    actualEndDate: '',
    actualStartDate: '',
    assignedTo: '',
    assignmentGroup: '',
    closedBy: '',
    closedDate: '',
    closedNotes: '',
    escalated: false,
    plannedEndDate: '',
    plannedStartDate: '',
    state: 0

  }
  Object.assign(optional, outputObject, inputOptional)

  const currentDateTime = new Date()

  const { insertedId: id } = await context.app.mongo.db.collection('chgItems').insertOne({
    ...required,
    ...optional,
    channel: GlobalChannel[required.channel],
    impact: GlobalImpact[required.impact],
    urgency: GlobalUrgency[required.urgency],
    risk: CHGRisk[required.risk]
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.chg.create" action to look at the payload

  context.app.log.debug(id.toString(), 'PRB: MAIN ID')

  await context.app.mongo.db.collection('prbActivityLog').insertOne({
    date: currentDateTime,
    fields: {
      ...required,
      ...optional,
      channel: GlobalChannel[required.channel],
      state: CHGState[optional?.state],
      impact: GlobalImpact[required.impact],
      urgency: GlobalUrgency[required.urgency],
      risk: CHGRisk[required.risk]
    },
    ref: id,
    type: 'field',
    user: required.user,
    system: false
  })

  return { number: required.number, result: true }
}
