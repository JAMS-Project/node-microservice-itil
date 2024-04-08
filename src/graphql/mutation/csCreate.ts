import { GlobalChannel, GlobalOnHoldReason, GlobalPriority, CSState } from '../../declaration/enum.js'
import { ICSCreateCase } from '../../declaration/interfaces.js'

export const csCreate = async (parent: any, args: ICSCreateCase, context: any): Promise<{ number?: string, result: boolean }> => {
  const { number, channel, user, priority, asset, shortDescription, description } = args

  // first, lets check to make sure that the number isn't already used
  const result = await context.app.mongo.db.collection('csItems').countDocuments({ number })
  if (result > 0) {
    throw new Error('Number already being used. Unable to submit.')
  }

  // second, check to make sure the contact exists
  // @todo RabbitMQ Call to Users Service via RPC to check to make sure user exists

  // this, if the asset exists, check to make sure it a valid one
  if (typeof asset !== 'undefined') {
    // @todo RabbitMQ Call to CMDB Service via RPC to validate it exists
  }

  const currentDateTime = new Date()

  const { insertedId: id } = await context.app.mongo.db.collection('csItems').insertOne({
    number,
    state: CSState.NEW, // @todo This can be override by backend users
    holdReason: GlobalOnHoldReason.UNSET,
    dateCreated: currentDateTime,
    user,
    channel: GlobalChannel[channel],
    priority: GlobalPriority[priority],
    escalated: false, // @todo Possible based off "field" in future or asset
    asset,
    assignedTo: '',
    assignmentGroup: '',
    shortDescription,
    description
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.create" action to look at the payload

  context.app.log.debug(id.toString(), 'CS: MAIN ID')

  await context.app.mongo.db.collection('csActivityLog').insertOne({
    date: currentDateTime,
    fields: {
      state: CSState.NEW,
      assignedTo: '',
      assignmentGroup: '',
      shortDescription
    },
    ref: id,
    type: 'field', // Field Modification Change
    user
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.activityLog" action to look at the payload

  return { number, result: true }
}
