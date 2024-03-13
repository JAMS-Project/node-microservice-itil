import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'
import {CSOnHoldReason, CSState} from "../src/declaration/enum";
import {zeroPad} from "../src/helpers/utils";
import graphqlMutation from "./__fixtures__/graphqlMutation";
import graphqlQuery from "./__fixtures__/graphqlQuery";

let server: FastifyInstance
let csTestCaseNumber: string = `CS0000001`

beforeAll(async () => {
  server = await buildApp(fastify())

  await server.ready()

  // create defaults
  await server.mongo.db?.collection('csItems').deleteMany()
  await server.mongo.db?.collection('csActivityLog').deleteMany()
  await server.mongo.db?.collection('csNotes').deleteMany()

  await server.mongo.db?.collection('misc').deleteMany()
  await server.mongo.db?.collection('misc').insertOne({name: 'numberCsLen', value: 7, system: true})
  await server.mongo.db?.collection('misc').insertOne({name: 'numberIncLen', value: 7, system: true})
  await server.mongo.db?.collection('misc').insertOne({name: 'numberPrbLen', value: 7, system: true})
  await server.mongo.db?.collection('misc').insertOne({name: 'numberChgLen', value: 7, system: true})
  await server.mongo.db?.collection('misc').insertOne({name: 'numberCs', value: 0, system: false})
  await server.mongo.db?.collection('misc').insertOne({name: 'numberInc', value: 0, system: false})
  await server.mongo.db?.collection('misc').insertOne({name: 'numberPrb', value: 0, system: false})
  await server.mongo.db?.collection('misc').insertOne({name: 'numberChg', value: 0, system: false})
  // end defaults

})

afterAll(async () => {
  // called once after all tests run
  await server.close()
})

describe('cs - basic tests', () => {

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

  describe('cs', () => {

    test('create', async() => {

      // total length of numbers
      const {value: valueLen } = await server.mongo.db?.collection('misc').findOne({ name: 'numberCsLen' })
      // get number
      let {value: currentNumber} = await server.mongo.db?.collection('misc').findOne({ name: 'numberCs' })
      // increase count by one
      currentNumber++
      // update the database
      await server.mongo.db?.collection('misc').updateOne({ name: 'numberCs' }, { $set: { value: currentNumber } })
      // zeroPad the value
      const valueString = zeroPad(currentNumber, valueLen)

      const gql = graphqlMutation('csCreate', {
          'number': { value: `CS${valueString}`, required: true },
          'channel': {
            value: 'SELF_SERVE',
            type: "CSChannel", required: true },
          'contact': { value: '00000001', required: true },
          'priority': {
            value: 'LOW',
            type: "CSPriority", required: true },
          'asset': { value: '00000001' },
          'shortDescription': { value: 'Hello, World!', required: true },
          'description': { value: 'Foo Bar', required: true },
      })
      server.log.debug(gql, 'CS:UNIT TEST:CREATE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { csCreate: boolean }}>().data.csCreate).toBe(true)

    })

    test('query - all', async () => {

      const gql = graphqlQuery('csQuery', ['number'])
      server.log.debug(gql, 'CS:UNIT TEST:QUERY :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { csQuery: [{ number: string}] }}>().data.csQuery[0].number).toBe("CS0000001")

    })

    test('query - single', async () => {

      const gql = graphqlQuery('csQuery', ['number'], {
        'number': { value: csTestCaseNumber }
      })
      server.log.debug(gql, 'CS:UNIT TEST:QUERY SINGLE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { csQuery: [{ number: string}] }}>().data.csQuery[0].number).toBe("CS0000001")
      expect(result.json<{ data: { csQuery: [{ number: string}] }}>().data.csQuery.length).toBe(1)

    })

    test('add note', async () => {

      const gql = graphqlMutation('csCreateNote', {
        'number': { value: csTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "CSChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'note', required: true },
        'note': { value: 'New Note', required: true }
      })
      server.log.debug(gql, 'CS:UNIT TEST:CREATE NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { csCreateNote: boolean }}>().data.csCreateNote).toBe(true)

    })

    test('add work node', async () => {
      const gql = graphqlMutation('csCreateNote', {
        'number': { value: csTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "CSChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'workNote', required: true },
        'note': { value: 'New Work Note', required: true }
      })
      server.log.debug(gql, 'CS:UNIT TEST:CREATE WORK NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { csCreateNote: boolean }}>().data.csCreateNote).toBe(true)
    })

    describe('actions', () => {

      test('state: new --> in progress', async() => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state:  CSState.IN_PROGRESS }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - NEW --> IN PROGRESS  :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: in progress --> on hold, awaiting caller', async () => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state', 'holdReason'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.ON_HOLD, holdReason: CSOnHoldReason.INFO  }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> ON HOLD, NEED INFO :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: on hold, awaiting caller --> in progress', async () => {

        // On hold, awaiting caller state can flip to this state manually,
        // or can be trigger by someone "adding a note" to the CS case.
        // This would come in the form
        // of a rabbitmq listing to itil.cs.note listener

        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state', 'holdReason'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.IN_PROGRESS, holdReason: CSOnHoldReason.UNSET  }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - ON HOLD, NEED INFO --> IN PROGRESS :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: in progress --> proposed solution', async () => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.SOLUTION_PROPOSED }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> SOLUTION PROPOSED :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: proposed solution --> rejected solution', async () => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.SOLUTION_REJECTED  }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - SOLUTION PROPOSED --> SOLUTION REJECTED :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: rejected solution --> in progress', async () => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.IN_PROGRESS  }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - SOLUTION REJECTED --> IN PROGRESS :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: in progress --> proposed solution', async () => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.SOLUTION_PROPOSED }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - IN PROGRESS --> SOLUTION PROPOSED :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: proposed solution --> resolved', async () => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.RESOLVED,  }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - SOLUTION PROPOSED -->RESOLVED :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

      test('state: resolved --> closed', async () => {
        const gql = graphqlMutation('csModifyField', {
          'number': { value: csTestCaseNumber, required: true },
          'field': { value: ['state'], type: '[String!]', required: true },
          'user': { value: `0000001`, required: true },
          'input': { value: { state: CSState.CLOSED  }, type: 'CSModifyFields', required: true },
        })
        server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE - RESOLVED --> CLOSED :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { csModifyField: boolean }}>().data.csModifyField).toBe(true)

      })

    })

  })

})