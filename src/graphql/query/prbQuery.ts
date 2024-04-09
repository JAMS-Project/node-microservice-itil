export const prbQuery = async (parent: any, args: Record<string, any>, context: any): Promise<any[] | any> => {
  return await context.app.mongo.db.collection('prbItems').find(args).toArray()
}
