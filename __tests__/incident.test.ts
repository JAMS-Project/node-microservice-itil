import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'
import {GlobalChannel, GlobalOnHoldReason, INCState} from "../src/declaration/enum";
import {zeroPad} from "../src/helpers/utils";
import graphqlMutation from "./__fixtures__/graphqlMutation";
import graphqlQuery from "./__fixtures__/graphqlQuery";
import {checkCase} from "./__utils__/checkCase";

let server: FastifyInstance
let incTestCaseNumber: string

beforeAll(async () => {
  server = await buildApp(fastify())
  await server.ready()

  await server.mongo.db.collection('incItems').deleteMany()
  await server.mongo.db.collection('incActivityLog').deleteMany()
  await server.mongo.db.collection('incNotes').deleteMany()
  await server.mongo.db.collection('incDefaults').deleteMany()

  await server.mongo.db.collection('misc').deleteMany( { name: { $regex: /numberInc/ } } )
  await server.mongo.db.collection('misc').insertOne({name: 'numberIncLen', value: 7, system: true})
  await server.mongo.db.collection('misc').insertOne({name: 'numberInc', value: 0, system: true})

  await server.mongo.db.collection('incDefaults').insertOne({name: 'state', value: INCState.NEW, system: true})
  await server.mongo.db.collection('incDefaults').insertOne({name: 'escalated', value: false, system: true})
  await server.mongo.db.collection('incDefaults').insertOne({name: 'category', value: 'Hardware', system: true})
  await server.mongo.db.collection('incDefaults').insertOne({name: 'channel', value: GlobalChannel.WEB, system: true})

})

afterAll(async () => {
  // called once after all tests run
  await server.close()
})

describe('incident - basic tests', () => {

  describe('fastify', () => {

    test('graphql is available', async () => {
      const result = await server.inject({
        path: "/graphql"
      })
      expect(result.statusCode).toBe(400)
    })

    test('health checks good', async() => {
      const result = await server.inject({
        path: "/health"
      })
      expect(result.json<{ healthChecks: { mongodb: string }}>().healthChecks.mongodb).toBe('HEALTHY')
      expect(result.json<{ healthChecks: { rabbitmq: string }}>().healthChecks.rabbitmq).toBe('HEALTHY')
    })

  })

  describe('incident', () => {

    test('create', async() => {

      // total length of numbers
      const {value: valueLen } = await server.mongo.db.collection('misc').findOne({ name: 'numberIncLen' })
      // get number
      let {value: currentNumber} = await server.mongo.db.collection('misc').findOne({ name: 'numberInc' })
      // increase count by one
      currentNumber++
      // update the database
      await server.mongo.db.collection('misc').updateOne({ name: 'numberInc' }, { $set: { value: currentNumber } })
      // cs number
      const incNUmber = zeroPad(currentNumber, valueLen)

      const gql = graphqlMutation('incCreate',  ['number', 'result'],{
        'required': { value: {
          number: `INC${incNUmber}`,
            channel: 'SELF_SERVE',
            category: 'Hardware',
            user: '0000001',
            impact: 'LOW',
            urgency: 'LOW',
            shortDescription: 'Hello, World!',
            description: 'Foo Bar'},
          type: 'INCRequiredFields',
          required: true
        }
      })
      server.log.debug(gql, 'INC:UNIT TEST:CREATE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { incCreate: { result: boolean } }}>().data.incCreate.result).toBe(true)
      expect(result.json<{ data: { incCreate: { number: string } }}>().data.incCreate.number).toBe('INC0000001')

      incTestCaseNumber = result.json<{ data: { incCreate: { number: string } }}>().data.incCreate.number

      await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.NEW)

    })

    describe('create, attached to another...', () => {

      test('... incident as a child', async () => {

        // total length of numbers
        const {value: valueLen } = await server.mongo.db.collection('misc').findOne({ name: 'numberIncLen' })
        // get number
        let {value: currentNumber} = await server.mongo.db.collection('misc').findOne({ name: 'numberInc' })
        // increase count by one
        currentNumber++
        // update the database
        await server.mongo.db.collection('misc').updateOne({ name: 'numberInc' }, { $set: { value: currentNumber } })
        // cs number
        const incNUmber = zeroPad(currentNumber, valueLen)

        const gql = graphqlMutation('incCreate', ['number', 'result'],{
          'required': {
            value: {
              number: `INC${incNUmber}`,
              channel: 'SELF_SERVE',
              category: 'Hardware',
              user: '0000001',
              impact: 'LOW',
              urgency: 'LOW',
              shortDescription: 'Hello, World!',
              description: 'Foo Bar'
            },
            type: 'INCRequiredFields',
            required: true
          },
          'optional': {
            value: {
              parent: incTestCaseNumber
            },
            type: 'INCOptionalFields'
          }
        })
        server.log.debug(gql, 'INC:UNIT TEST:CREATE AS CHILD :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incCreate: { result: boolean} }}>().data.incCreate.result).toBe(true)
        expect(result.json<{ data: { incCreate: { number: string} }}>().data.incCreate.number).toBe('INC0000002')

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.NEW)

      })

      test.todo('... to a case')

    })

    test('query - all', async () => {

      const gql = graphqlQuery('incQuery', ['number'])
      server.log.debug(gql, 'INC:UNIT TEST:QUERY :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { incQuery: [{ number: string}] }}>().data.incQuery[0].number).toBe("INC0000001")

    })

    test('query - single', async () => {

      const gql = graphqlQuery('incQuery', ['number'], {
        'number': { value: incTestCaseNumber }
      })
      server.log.debug(gql, 'INC:UNIT TEST:QUERY SINGLE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { incQuery: [{ number: string}] }}>().data.incQuery[0].number).toBe("INC0000001")
      expect(result.json<{ data: { incQuery: [{ number: string}] }}>().data.incQuery.length).toBe(1)

    })

    test('add note', async () => {

      const gql = graphqlMutation('incCreateNote', [],{
        'number': { value: incTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'note', required: true },
        'note': { value: 'New Note', required: true }
      })
      server.log.debug(gql, 'INC:UNIT TEST:CREATE NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { incCreateNote: boolean }}>().data.incCreateNote).toBe(true)

    })

    test('add work node', async () => {
      const gql = graphqlMutation('incCreateNote', [],{
        'number': { value: incTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'workNote', required: true },
        'note': { value: 'New Work Note', required: true }
      })
      server.log.debug(gql, 'INC:UNIT TEST:CREATE WORK NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { incCreateNote: boolean }}>().data.incCreateNote).toBe(true)
    })

    describe('actions: copy', () => {

      test('... to a new incident', async () => {
        // get the fields needed to send back to the client to create a duplicate
        const gql = graphqlQuery('incCopy', ['number'], {
          'number': { value: incTestCaseNumber, required: true }
        })
        server.log.debug(gql, 'INC:UNIT TEST:QUERY SINGLE :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incCopy: { number: string } }}>().data.incCopy.number).toBe(incTestCaseNumber)

      })

    })

    describe('actions: state', () => {

      test('state: new - starting', async () => {
        await checkCase(server, 'incQuery', incTestCaseNumber, 'state', INCState.NEW)
      })

      test('state: new --> in progress', async () => {

        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: 'IN_PROGRESS' }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - NEW --> IN PROGRESS  :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.IN_PROGRESS)

      })

      test('state: in progress --> on hold, awaiting caller', async() => {

        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['state','holdReason'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: 'ON_HOLD', holdReason: 'INFO' }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> ON HOLD, NEED INFO :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.ON_HOLD)
        await checkCase(server, 'incQuery',incTestCaseNumber, 'holdReason', GlobalOnHoldReason.INFO)

      })

      test('state: in progress --> on hold, awaiting vendor', async () => {
        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['holdReason'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { holdReason: 'VENDOR' }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> ON HOLD, NEED INFO :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.ON_HOLD)
        await checkCase(server, 'incQuery',incTestCaseNumber, 'holdReason', GlobalOnHoldReason.VENDOR)
      })

      test('state: in progress --> on hold, awaiting re-assignment', async() => {
        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['holdReason'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { holdReason: 'RE_ASSIGNMENT' }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> ON HOLD, NEED INFO :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.ON_HOLD)
        await checkCase(server, 'incQuery',incTestCaseNumber, 'holdReason', GlobalOnHoldReason.RE_ASSIGNMENT)
      })

      test('state: in progress --> on hold, awaiting scheduling', async() => {
        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['holdReason'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { holdReason: 'PENDING_SCHEDULED' }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> ON HOLD, NEED INFO :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.ON_HOLD)
        await checkCase(server, 'incQuery',incTestCaseNumber, 'holdReason', GlobalOnHoldReason.PENDING_SCHEDULED)
      })

      test('state: on hold --> in progress, clear on hold reason', async () => {

        // On hold, awaiting caller state can flip to this state manually,
        // or can be trigger by someone "adding a note" to the INC case.
        // This would come in the form
        // of a rabbitmq listing to itil.inc.note listener

        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['state', 'holdReason'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: 'IN_PROGRESS', holdReason: 'UNSET'  }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - ON HOLD, NEED INFO --> IN PROGRESS :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.IN_PROGRESS)

      })

      test('state: in progress --> resolved', async () => {
        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: 'RESOLVED' }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> RESOLVED :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.RESOLVED)
      })

      test('state: resolved --> closed', async () => {
        const gql = graphqlMutation('incModifyField', [],{
          'number': { value: incTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: 'CLOSED' }, type: 'INCModifyFields', required: true },
        })
        server.log.debug(gql, 'INC:UNIT TEST:UPDATE FIELD - STATE - RESOLVED --> CLOSED :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incModifyField: boolean }}>().data.incModifyField).toBe(true)

        await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.CLOSED)
      })

    })

    describe('actions: sub-applications', () => {

      test.todo('... outage')

      test.todo('... communication')

      describe('major incident', () => {

        test.todo('... proposed')

        test.todo('... promote')

      })

      test.todo('... problem')

      test.todo('... change')

      test.todo('... task')

    })

  })

})