import {ICSQuery} from "../../declaration/interfaces";

export const csQuery = async (parent: any, args: Record<string, any>, context: any): Promise<ICSQuery[] | ICSQuery> => {
  return  await context.app.mongo.db?.collection('cs').find(args).toArray() as ICSQuery[] | ICSQuery
}
