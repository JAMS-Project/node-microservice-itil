export const chgQuery = async (parent: any, args: Record<string, any>, context: any): Promise<any[] | any> => {
  return await context.app.mongo.db.collection('chgItems').find(args).toArray()
}
