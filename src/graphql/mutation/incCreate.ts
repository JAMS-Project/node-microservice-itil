import {
  GlobalChannel,
  GlobalImpact,
  GlobalUrgency
} from "../../declaration/enum.js";
import {IINCCreate, IINCModifyFieldInput} from '../../declaration/interfaces.js'

export const incCreate = async (parent: any, args: IINCCreate, context: any): Promise<boolean> => {
  let { required, optional: inputOptional } = args

  const getDefaults = await context.app.mongo.db.collection('incDefaults').find().toArray()
  const outputObject: { [key: string]: string | number | boolean } = {};
  getDefaults.forEach((item: { name: string; value: string | number | boolean; }): void => {
    outputObject[item.name] = item.value;
  });

  let optional: IINCModifyFieldInput = {
    asset: "",
    assignedTo: "",
    assignmentGroup: "",
    category: "",
    change: "",
    changeCaused: "",
    channel: 0,
    escalated: false,
    holdReason: 0,
    offering: "",
    problem: "",
    service: "",
    state: 0,
    subCategory: ""
  }
  Object.assign(optional, outputObject, inputOptional)

  console.log(optional)

  // first, lets check to make sure that the number isn't already used
  const result = await context.app.mongo.db.collection('incItems').countDocuments({ number: required.number })
  if (result > 0) {
    throw new Error('Number already being used. Unable to submit.')
  }

  const currentDateTime = new Date()

  const { insertedId: id } = await context.app.mongo.db.collection('incItems').insertOne({
    ...required,
    ...optional,
    channel: GlobalChannel[required.channel],
    impact: GlobalImpact[required.impact],
    urgency: GlobalUrgency[required.urgency]
  })

  // @todo RabbitMQ Call to Let Know All Services that want to listen for "itil.cs.create" action to look at the payload

  context.app.log.debug(id.toString(), 'CS: MAIN ID')

  await context.app.mongo.db.collection('incActivityLog').insertOne({
    date: currentDateTime,
    fields: {
      user: required.user,
      state: optional?.state,
      holdReason: optional?.holdReason,
      shortDescription: required.shortDescription,
      escalated: optional?.escalated,
      asset: optional?.asset,
      assignedTo: optional?.assignedTo,
      assignmentGroup: optional?.assignmentGroup,
      category: required.category,
      impact: GlobalImpact[required.impact],
      urgency: GlobalUrgency[required.urgency]
    },
    ref: id,
    type: 'field',
    user: '',
    system: true
  })

  return true
}
