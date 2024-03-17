import {IINCQuery} from "../../declaration/types.js";

export const incQuery = async (parent: any, args: Record<string, any>, context: any): Promise<IINCQuery[] | IINCQuery> => {
  return await context.app.mongo.db.collection('incItems').find(args).toArray() as IINCQuery[] | IINCQuery
}
