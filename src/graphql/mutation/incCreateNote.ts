import { GlobalChannel } from '../../declaration/enum.js'
import { ICreateNote } from '../../declaration/interfaces.js'

export const incCreateNote = async (parent: any, args: ICreateNote, context: any): Promise<boolean> => {
  const { number, channel, user, note, type } = args

  // @todo RabbitMQ Call to Users Service via RPC to check to make sure user exists

  const { _id: findCase } = await context.app.mongo.db.collection('incItems').findOne({ number })

  if (typeof findCase !== 'undefined') {
    const currentDateTime = new Date()
    const id = findCase.toString()

    await context.app.mongo.db.collection('incNotes').insertOne({
      number: id,
      channel: GlobalChannel[channel],
      date: currentDateTime,
      note,
      type,
      user
    })

    // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.inc.note" action to look at the payload

    await context.app.mongo.db.collection('incActivityLog').insertOne({
      date: currentDateTime,
      ref: id,
      type,
      user
    })

    // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.inc.activityLog" action to look at the payload

    return true
  } else {
    throw new Error('Number does not exist.')
  }
}
