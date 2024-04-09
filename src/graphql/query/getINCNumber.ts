import {zeroPad} from "../../helpers/utils.js";

export const getINCNumber = async (parent: any, args: any, context: any): Promise<string> => {
  // total length of numbers
  const {value: valueLen } = await context.app.mongo.db.collection('misc').findOne({ name: 'numberIncLen' })
  // get number
  let {value: currentNumber} = await context.app.mongo.db.collection('misc').findOne({ name: 'numberInc' })
  // increase count by one
  currentNumber++
  // update the database
  await context.app.mongo.db.collection('misc').updateOne({ name: 'numberInc' }, { $set: { value: currentNumber } })
  // return the number
  return `INC${zeroPad(currentNumber, valueLen)}`
}