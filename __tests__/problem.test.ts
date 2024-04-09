import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'
import {GlobalChannel, INCState, PRBChannel, PRBState} from "../src/declaration/enum";
import {zeroPad} from "../src/helpers/utils";
import graphqlMutation from "./__fixtures__/graphqlMutation";
import graphqlQuery from "./__fixtures__/graphqlQuery";
import {checkCase} from "./__utils__/checkCase";

let server: FastifyInstance
let prbTestCaseNumber: string

beforeAll(async () => {
  server = await buildApp(fastify())
  await server.ready()

  await server.mongo.db.collection('prbItems').deleteMany()
  await server.mongo.db.collection('prbActivityLog').deleteMany()
  await server.mongo.db.collection('prbNotes').deleteMany()
  await server.mongo.db.collection('prbDefaults').deleteMany()

  await server.mongo.db.collection('misc').deleteMany( { name: { $regex: /numberPrb/ } } )
  await server.mongo.db.collection('misc').insertOne({name: 'numberPrbLen', value: 7, system: true})
  await server.mongo.db.collection('misc').insertOne({name: 'numberPrb', value: 0, system: true})

  await server.mongo.db.collection('prbDefaults').insertOne({name: 'state', value: INCState.NEW, system: true})
  await server.mongo.db.collection('prbDefaults').insertOne({name: 'escalated', value: false, system: true})
  await server.mongo.db.collection('prbDefaults').insertOne({name: 'category', value: 'Hardware', system: true})
  await server.mongo.db.collection('prbDefaults').insertOne({name: 'channel', value: PRBChannel.MANUAL, system: true})

})

afterAll(async () => {
  // called once after all tests run
  await server.close()
})

describe('problem - basic tests', () => {

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

  describe('problem', () => {

    test('create', async() => {

      const gqlGetPrbNUmber = graphqlQuery('getPRBNumber')
      const resultPrbNUmber = await server.inject({
        method: "POST",
        body: gqlGetPrbNUmber,
        path: "/graphql"
      })

      const gql = graphqlMutation('prbCreate',  ['number', 'result'],{
        'required': { value: {
            number: resultPrbNUmber.json<{ data: { getPRBNumber: string }}>().data.getPRBNumber,
            user: '0000001',
            category: 'Hardware',
            channel: 'MANUAL',
            impact: 'LOW',
            urgency: 'LOW',
            statement: 'Hello, World!',
            description: 'Foo Bar'
          },
          type: 'PRBRequiredFields',
          required: true
        }
      })
      server.log.debug(gql, 'PRB:UNIT TEST:CREATE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { prbCreate: { result: boolean } }}>().data.prbCreate.result).toBe(true)
      expect(result.json<{ data: { prbCreate: { number: string } }}>().data.prbCreate.number).toBe(resultPrbNUmber.json<{ data: { getPRBNumber: string }}>().data.getPRBNumber)

      prbTestCaseNumber = result.json<{ data: { prbCreate: { number: string } }}>().data.prbCreate.number

      await checkCase(server, 'prbQuery',prbTestCaseNumber, 'state', PRBState.NEW)

    })

    test('query - all', async () => {

      const gql = graphqlQuery('prbQuery', ['number'])
      server.log.debug(gql, 'PRB:UNIT TEST:QUERY :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { prbQuery: [{ number: string}] }}>().data.prbQuery[0].number).toBe(prbTestCaseNumber)

    })

    test('query - single', async () => {

      const gql = graphqlQuery('prbQuery', ['number'], {
        'number': { value: prbTestCaseNumber }
      })
      server.log.debug(gql, 'PRB:UNIT TEST:QUERY SINGLE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { prbQuery: [{ number: string}] }}>().data.prbQuery[0].number).toBe(prbTestCaseNumber)
      expect(result.json<{ data: { prbQuery: [{ number: string}] }}>().data.prbQuery.length).toBe(1)

    })

    test('add note', async () => {

      const gql = graphqlMutation('prbCreateNote', [],{
        'number': { value: prbTestCaseNumber, required: true },
        'channel': { value: 'MANUAL', type: "PRBChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'note', required: true },
        'note': { value: 'New Note', required: true }
      })
      server.log.debug(gql, 'PRB:UNIT TEST:CREATE NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { prbCreateNote: boolean }}>().data.prbCreateNote).toBe(true)

    })

    test('add work node', async () => {
      const gql = graphqlMutation('prbCreateNote', [],{
        'number': { value: prbTestCaseNumber, required: true },
        'channel': { value: 'MANUAL', type: "PRBChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'workNote', required: true },
        'note': { value: 'New Work Note', required: true }
      })
      server.log.debug(gql, 'PRB:UNIT TEST:CREATE WORK NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { prbCreateNote: boolean }}>().data.prbCreateNote).toBe(true)
    })

    describe('actions: state', () => {

      test('state: starting at NEW', async () => {
        await checkCase(server, 'prbQuery', prbTestCaseNumber, 'state', PRBState.NEW)
      })

      ;["ASSESS","RCA","FIX_IN_PROGRESS","RESOLVED","CLOSED"].forEach(state => {

        test(`state: change to --> ${state}`, async () => {

          const gql = graphqlMutation('prbModifyField', [], {
            'number': {value: prbTestCaseNumber, required: true},
            'field': {value: ['state'], type: '[String!]', required: true},
            'user': {value: `0000001`, required: true},
            'input': {value: {state}, type: 'PRBModifyFields', required: true},
          })
          server.log.debug(gql, 'PRB:UNIT TEST:UPDATE FIELD - STATE - NEW --> ASSESS  :: GQL')

          const result = await server.inject({
            method: "POST",
            body: gql,
            path: "/graphql"
          })
          expect(result.json<{ data: { prbModifyField: boolean } }>().data.prbModifyField).toBe(true)

          await checkCase(server, 'prbQuery', prbTestCaseNumber, 'state', PRBState[state])

        })

      })

      test('state: CLOSED --> NEW (fail)', async () => {

        const gql = graphqlMutation('prbModifyField', [], {
          'number': {value: prbTestCaseNumber, required: true},
          'field': {value: ['state'], type: '[String!]', required: true},
          'user': {value: `0000001`, required: true},
          'input': {value: {state: 'NEW'}, type: 'PRBModifyFields', required: true},
        })

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ errors: [{ message: string}] }>().errors[0].message).toBe("Progress for problem state can only go forward. Not backwards.")
        await checkCase(server, 'prbQuery', prbTestCaseNumber, 'state', PRBState.CLOSED)

      })


    })

  })

})