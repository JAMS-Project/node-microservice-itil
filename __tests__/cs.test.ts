import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'
import {GlobalOnHoldReason, CSState, INCState, GlobalChannel} from "../src/declaration/enum";
import {zeroPad} from "../src/helpers/utils";
import graphqlMutation from "./__fixtures__/graphqlMutation";
import graphqlQuery from "./__fixtures__/graphqlQuery";
import {checkCase} from "./__utils__/checkCase";

let server: FastifyInstance
let csTestCaseNumber: string

beforeAll(async () => {
  server = await buildApp(fastify())
  await server.ready()

  await server.mongo.db.collection('csItems').deleteMany()
  await server.mongo.db.collection('csActivityLog').deleteMany()
  await server.mongo.db.collection('csNotes').deleteMany()

  await server.mongo.db.collection('misc').deleteMany( { name: { $regex: /numberCs/ } } )
  await server.mongo.db.collection('misc').insertOne({name: 'numberCsLen', value: 7, system: true})
  await server.mongo.db.collection('misc').insertOne({name: 'numberCs', value: 0, system: true})

  await server.mongo.db.collection('csDefaults').insertOne({name: 'state', value: CSState.NEW, system: true})
  await server.mongo.db.collection('csDefaults').insertOne({name: 'escalated', value: false, system: true})
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
      const {value: valueLen } = await server.mongo.db.collection('misc').findOne({ name: 'numberCsLen' })
      // get number
      let {value: currentNumber} = await server.mongo.db.collection('misc').findOne({ name: 'numberCs' })
      // increase count by one
      currentNumber++
      // update the database
      await server.mongo.db.collection('misc').updateOne({ name: 'numberCs' }, { $set: { value: currentNumber } })
      // cs number
      const csNUmber = zeroPad(currentNumber, valueLen)

      const gql = graphqlMutation('csCreate',  ['number','result'],{
        'required': {
          value: {
            number: `CS${csNUmber}`,
            channel: 'SELF_SERVE',
            category: 'Hardware',
            user: '0000001',
            priority: 'LOW',
            shortDescription: 'Hello, World!',
            description: 'Foo Bar'
          },
          type: 'CSRequiredFields',
          required: true
        }
      })
      server.log.debug(gql, 'CS:UNIT TEST:CREATE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { csCreate: { result: boolean } }}>().data.csCreate.result).toBe(true)
      expect(result.json<{ data: { csCreate: { number: string } }}>().data.csCreate.number).toBe('CS0000001')

      csTestCaseNumber = result.json<{ data: { csCreate: { number: string } }}>().data.csCreate.number

      await checkCase(server,'csQuery',csTestCaseNumber, 'state', CSState.NEW)

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

      const gql = graphqlMutation('csCreateNote',  [],{
        'number': { value: csTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
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
      const gql = graphqlMutation('csCreateNote', [],{
        'number': { value: csTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
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

    describe('actions: state', () => {

      test('...new', async () => {
        await checkCase(server, 'csQuery', csTestCaseNumber, 'state', CSState.NEW)
      })


      ;[{
        state: "IN_PROGRESS", holdReason: "UNSET"},
        {state: "ON_HOLD", holdReason: "INFO"},
        {state: "SOLUTION_PROPOSED", holdReason: "UNSET"},
        {state: "SOLUTION_REJECTED", holdReason: "UNSET"},
        {state: "IN_PROGRESS", holdReason: "UNSET"},
        {state: "SOLUTION_PROPOSED", holdReason: "UNSET"},
        {state: "RESOLVED", holdReason: "UNSET"},
        {state: "CLOSED", holdReason: "UNSET"}
      ].forEach((fullState: {
        holdReason: string,
        state: string
      }) => {

        test(`...change to ${fullState.state} with hold reason ${fullState.holdReason}`, async () => {

          const gql = graphqlMutation('csModifyField', [], {
            'number': {value: csTestCaseNumber, required: true},
            'field': {value: ['state','holdReason'], type: '[String!]', required: true},
            'user': {value: `0000001`, required: true},
            'input': {value: {...fullState}, type: 'CSModifyFields', required: true},
          })
          server.log.debug(gql, 'CS:UNIT TEST:UPDATE FIELD - STATE :: GQL')

          const result = await server.inject({
            method: "POST",
            body: gql,
            path: "/graphql"
          })
          expect(result.json<{ data: { csModifyField: boolean } }>().data.csModifyField).toBe(true)

          await checkCase(server, 'csQuery', csTestCaseNumber, 'state', CSState[fullState.state])
          await checkCase(server, 'csQuery',csTestCaseNumber, 'holdReason', GlobalOnHoldReason[fullState.holdReason])

        })

      })

    })

    describe('actions: create', () => {

      test('... incident', async () => {

        const gqlCs = graphqlQuery(
          'csQuery',
          ['user', 'asset', 'number'],
          {
            'number': { value: csTestCaseNumber }
          }
        )
        server.log.debug(gqlCs, 'CS:UNIT TEST:QUERY SINGLE :: GQL')

        const resultCs = await server.inject({
          method: "POST",
          body: gqlCs,
          path: "/graphql"
        })

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
          'required': {
            value: {
              number: `INC${incNUmber}`,
              channel: 'SELF_SERVE',
              category: 'Hardware',
              user: resultCs.json<{ data: { csQuery: [{ user: string }] }}>().data.csQuery[0].user,
              impact: 'LOW',
              urgency: 'LOW',
              shortDescription: 'Hello, World!',
              description: 'Foo Bar'
            },
            type: 'INCRequiredFields',
            required: true
          },
          'optional' : {
            value: {
              asset: resultCs.json<{ data: { csQuery: [{ asset?: string }] }}>().data.csQuery[0].asset || '',
              parent: resultCs.json<{ data: { csQuery: [{ number: string }] }}>().data.csQuery[0].number,
            },
            type: 'INCOptionalFields'
          }
        })
        server.log.debug(gql, 'INC:UNIT TEST:CREATE :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { incCreate: { result: boolean } }}>().data.incCreate.result).toBe(true)

      })

      test.todo('... request')

    })

  })

})