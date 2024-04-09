import {zeroPad} from "../../helpers/utils.js";

export const getPRBNumber = async (parent: any, args: any, context: any): Promise<string> => {
  // total length of numbers
  const {value: valueLen } = await context.app.mongo.db.collection('misc').findOne({ name: 'numberPrbLen' })
  // get number
  let {value: currentNumber} = await context.app.mongo.db.collection('misc').findOne({ name: 'numberPrb' })
  // increase count by one
  currentNumber++
  // update the database
  await context.app.mongo.db.collection('misc').updateOne({ name: 'numberPrb' }, { $set: { value: currentNumber } })
  // return the number
  return `PRB${zeroPad(currentNumber, valueLen)}`
}