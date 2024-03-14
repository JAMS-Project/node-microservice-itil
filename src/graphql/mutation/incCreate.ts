import {IINCCreate} from '../../declaration/interfaces.js'

export const incCreate = async (parent: any, args: IINCCreate, context: any): Promise<boolean> => {
  const { required, optional } = args

  // first, lets check to make sure that the number isn't already used
  const result = await context.app.mongo.db.collection('incItems').countDocuments({ number: required.number })
  if (result > 0) {
    throw new Error('Number already being used. Unable to submit.')
  }


  return true
}
