import {CSChannel, CSOnHoldReason, CSPriority, CSState} from "../../declaration/enum.js";
import {ICSModifyField} from "../../declaration/interfaces.js";

export const csModifyField = async (_parent: any, args: ICSModifyField, context: any): Promise<boolean> => {

  const { number, field, input } = args

  const { _id: findCase } = await context.app.mongo.db.collection('csItems').findOne({ 'number': number })

  if (typeof findCase !== 'undefined') {
    // case id
    const id = findCase.toString()
    // stored new values
    let data: string

    switch (field) {
      case 'state':
        data = CSState[input.state]
        break
      case 'channel':
        data = CSChannel[input.channel]
        break
      case 'priority':
        data = CSPriority[input.priority]
        break
      default:
        throw new Error('Not able to match a valid CS field')
    }

    context.app.log.debug('Data to Modify Field To: %s', data)

    return true
  } else {
    throw  new Error('Number case not found.')
  }

}