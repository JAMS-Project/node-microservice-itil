import {zeroPad} from "../../helpers/utils.js";

export const getCSNumber = async (parent: any, args: any, context: any): Promise<string> => {
  // total length of numbers
  const {value: valueLen } = await context.app.mongo.db.collection('misc').findOne({ name: 'numberCsLen' })
  // get number
  let {value: currentNumber} = await context.app.mongo.db.collection('misc').findOne({ name: 'numberCs' })
  // increase count by one
  currentNumber++
  // update the database
  await context.app.mongo.db.collection('misc').updateOne({ name: 'numberCs' }, { $set: { value: currentNumber } })
  // return the number
  return `CS${zeroPad(currentNumber, valueLen)}`
}