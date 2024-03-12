import { ICSCreateNote } from '../../declaration/interfaces.js'

export const csCreateNote = async (parent: any, args: ICSCreateNote, context: any): Promise<boolean> => {
  const { number, channel, user, note, type } = args

  // second, check to make sure the contact exists
  // @todo RabbitMQ Call to Users Service via RPC to check to make sure user exists

  const { result: findCase } = await context.app.mongo.db.collection('cs').findOne({ number })

  if (typeof findCase !== 'undefined') {
    const currentDateTime = new Date()
    const id = findCase._id.toString()

    await context.app.mongo.db.collection('csNotes').insertOne({
      case: id,
      channel,
      date: currentDateTime,
      note,
      type,
      user
    })

    // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.note" action to look at the payload

    await context.app.mongo.db.collection('csActivityLog').insertOne({
      date: currentDateTime,
      ref: id,
      type,
      user
    })

    // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.activityLog" action to look at the payload

    return true

  } else {
    throw new Error('Number does not exist.')
  }

}
