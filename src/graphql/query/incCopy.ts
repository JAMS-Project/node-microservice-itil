import { IINCQuery } from '../../declaration/types.js'

export const incCopy = async (parent: any, args: {number: string}, context: any): Promise<IINCQuery[] | IINCQuery> => {
  const { number} = args
  context.app.log.debug(`Number ${number}`)
  return await context.app.mongo.db.collection('incItems').findOne({number}) as IINCQuery[] | IINCQuery
}