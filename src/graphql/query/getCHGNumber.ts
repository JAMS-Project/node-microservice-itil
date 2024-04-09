import {zeroPad} from "../../helpers/utils.js";

export const getCHGNumber = async (parent: any, args: any, context: any): Promise<string> => {
  // total length of numbers
  const {value: valueLen } = await context.app.mongo.db.collection('misc').findOne({ name: 'numberChgLen' })
  // get number
  let {value: currentNumber} = await context.app.mongo.db.collection('misc').findOne({ name: 'numberChg' })
  // increase count by one
  currentNumber++
  // update the database
  await context.app.mongo.db.collection('misc').updateOne({ name: 'numberChg' }, { $set: { value: currentNumber } })
  // return the number
  return `CHG${zeroPad(currentNumber, valueLen)}`
}