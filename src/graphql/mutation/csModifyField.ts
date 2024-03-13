import {CSChannel, CSOnHoldReason, CSPriority, CSState} from "../../declaration/enum.js";
import {ICSModifyField} from "../../declaration/interfaces.js";

export const csModifyField = async (_parent: any, args: ICSModifyField, context: any): Promise<boolean> => {

  const { number, user,  field, input } = args

  const findCase = await context.app.mongo.db.collection('csItems').findOne({ 'number': number })

  const currentDateTime = new Date()

  let id: string | unknown
  const fields: {[field: string]: string | number | boolean} = {}
  const previousFields: {[field: string]: string | number | boolean} = {}

  for (const fieldLoop of field) {

    if (typeof findCase !== 'undefined') {

      // case id
      id = findCase._id.toString()
      // stored new values
      let data: string | number | boolean

      switch (fieldLoop) {
        case 'state':
          data = input.state
          break
        case 'channel':
          data = input.channel
          break
        case 'priority':
          data = input.priority
          break
        case 'holdReason':
          data = input.holdReason === -1 ? "" : input.holdReason
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
          throw new Error('Not able to match a valid CS field')
      }

      // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.activityLog" action to look at the payload

      fields[fieldLoop] = data
      previousFields[fieldLoop] = findCase[fieldLoop]

    } else {
      throw  new Error('Number case not found.')
    }

  }

  if (typeof id === 'undefined') {
    throw  new Error('Object MongoDB ID not found.')
  }

  // update the case
  await context.app.mongo.db.collection('csItems').updateOne( { number },{$set: {...fields, ...previousFields}})

  // update the activity log
  await context.app.mongo.db.collection('csActivityLog').insertOne({
    date: currentDateTime,
    fields,
    previousFields,
    ref: id,
    type: 'field', // Field Modification Change
    user
  })

  return true


}