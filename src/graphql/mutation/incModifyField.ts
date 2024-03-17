import {GlobalChannel, GlobalImpact, GlobalOnHoldReason, GlobalUrgency, INCState} from "../../declaration/enum.js";
import {IINCModifyFields} from "../../declaration/interfaces.js";

export const incModifyField = async (_parent: any, args: IINCModifyFields, context: any): Promise<boolean> => {
  const { number, user, field, input } = args

  const findCase = await context.app.mongo.db.collection('incItems').findOne({ number })

  const currentDateTime = new Date()

  let id: string | unknown

  const fields: { [field: string]: string | number | boolean } = {}
  const previousFields: { [field: string]: string | number | boolean } = {}

  for (const fieldLoop of field) {
    if (typeof findCase !== 'undefined') {
      // case id
      id = findCase._id.toString()
      // stored new values
      let data: string | number | boolean

      switch (fieldLoop) {
        case 'channel':
          data = GlobalChannel[input.channel]
          break
        case 'urgency':
          data = GlobalUrgency[input.urgency]
          break
        case 'impact':
          data = GlobalImpact[input.impact]
          break
        case 'holdReason':
          data = GlobalOnHoldReason[input.holdReason]
          break
        case 'state':
          data = INCState[input.state]
          break
        case 'escalated':
          data = input.escalated
          break
        case 'user':
        case 'asset':
        case 'assignedTo':
        case 'assignmentGroup':
        case 'shortDescription':
        case 'description':
          data = input[fieldLoop] as string
          break
        default:
          throw new Error('Not able to match a valid INC field')
      }

      fields[fieldLoop] = data
      previousFields[fieldLoop] = findCase[fieldLoop]
    } else {
      throw new Error('Number case not found.')
    }
  }

  if (typeof id === 'undefined') {
    throw new Error('Object MongoDB ID not found.')
  }

  // update the case
  await context.app.mongo.db.collection('incItems').updateOne({ number }, { $set: { ...fields } })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.inc.modify" action to look at the payload

  // update the activity log
  await context.app.mongo.db.collection('incActivityLog').insertOne({
    date: currentDateTime,
    fields,
    previousFields,
    ref: id,
    type: 'field', // Field Modification Change
    user
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.inc.activityLog" action to look at the payload

  return true
}
