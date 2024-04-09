import {GlobalChannel, GlobalOnHoldReason, GlobalPriority, CSState, CHGState, PRBState} from '../../declaration/enum.js'
import {ICHGModifyFields, ICSModifyField} from '../../declaration/interfaces.js'

export const chgModifyField = async (_parent: any, args: ICHGModifyFields, context: any): Promise<boolean> => {
  const { number, user, field, input } = args

  const findCase = await context.app.mongo.db.collection('chgItems').findOne({ number })

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
        case 'state':
          switch (CHGState[findCase[fieldLoop]]) {
            case 'CLOSED':
            case 'CANCELLED':
              throw new Error('Unable to change the state. Not allowed from current state.')
            default:
              data = CHGState[input.state]
          }
          break
        case 'channel':
          data = GlobalChannel[input.channel]
          break
        case 'impact':
          data = GlobalChannel[input.channel]
          break
        case 'urgency':
          data = GlobalChannel[input.channel]
          break
        case 'risk':
          data = GlobalChannel[input.channel]
          break
        case 'escalated':
          data = input.escalated
          break
        case 'user':
        case 'assignedTo':
        case 'assignmentGroup':
        case 'shortDescription':
        case 'plannedStartDate':
        case 'plannedEndDate':
        case 'actualStartDate':
        case 'actualEndDate':
        case 'closedDate':
        case 'closedNotes':
        case 'closedBy':
          data = input[fieldLoop] as string
          break
        default:
          throw new Error('Not able to match a valid CHG field')
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
  await context.app.mongo.db.collection('chgItems').updateOne({ number }, { $set: { ...fields } })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.chg.modify" action to look at the payload

  // update the activity log
  await context.app.mongo.db.collection('chgActivityLog').insertOne({
    date: currentDateTime,
    fields,
    previousFields,
    ref: id,
    type: 'field', // Field Modification Change
    user
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.chg.activityLog" action to look at the payload

  return true
}
