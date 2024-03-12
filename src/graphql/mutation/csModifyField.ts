import {CSChannel, CSOnHoldReason, CSPriority, CSState} from "../../declaration/enum.js";
import {ICSModifyField} from "../../declaration/interfaces.js";

export const csModifyField = async (_parent: any, args: ICSModifyField, context: any): Promise<boolean> => {

  const { number, field, input } = args

  const { result: findCase } = await context.app.mongo.db.collection('cs').findOne({ 'number': number })

  if (typeof findCase !== 'undefined') {

    // stored new values
    let data: string

    switch (field) {
      case 'state':
        data = CSState[input.state]
        break
      case 'holdReason':
        data = CSOnHoldReason[input.holdReason]
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

    context.app.log.debug(data, 'Data to Modify Field To')

    return true
  } else {
    throw  new Error('Number case not found.')
  }

}