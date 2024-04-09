import { GlobalChannel, GlobalOnHoldReason, GlobalPriority, CSState } from '../../declaration/enum.js'
import { ICSFields, ICSOptionalFieldInput } from '../../declaration/interfaces.js'

export const csCreate = async (parent: any, args: ICSFields, context: any): Promise<{ number?: string, result: boolean }> => {

  const { required, optional: inputOptional } = args

  // first, lets check to make sure that the number isn't already used
  const result = await context.app.mongo.db.collection('csItems').countDocuments({ number: required.number })
  if (result > 0) {
    throw new Error('Number already being used. Unable to submit.')
  }

  const getDefaults = await context.app.mongo.db.collection('csDefaults').find().toArray()
  const outputObject: { [key: string]: string | number | boolean } = {}
  getDefaults.forEach((item: { name: string, value: string | number | boolean }): void => {
    outputObject[item.name] = item.value
  })

  const optional: ICSOptionalFieldInput = {
    asset: '',
    escalated: false,
    state: 0
  }
  Object.assign(optional, outputObject, inputOptional)

  const currentDateTime = new Date()

  const { insertedId: id } = await context.app.mongo.db.collection('csItems').insertOne({
    ...required,
    ...optional,
    channel: GlobalChannel[required.channel],
    priority: GlobalPriority[required.priority],
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.create" action to look at the payload

  context.app.log.debug(id.toString(), 'CS: MAIN ID')

  await context.app.mongo.db.collection('csActivityLog').insertOne({
    date: currentDateTime,
    fields: {

    },
    ref: id,
    type: 'field',
    user: '',
    system: true
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.activityLog" action to look at the payload

  return { number: required.number, result: true }
}
