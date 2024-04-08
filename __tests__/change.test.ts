import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'
import {CHGState} from "../src/declaration/enum";
import {zeroPad} from "../src/helpers/utils";
import graphqlMutation from "./__fixtures__/graphqlMutation";
import graphqlQuery from "./__fixtures__/graphqlQuery";
import {checkCase} from "./__utils__/checkCase";

let server: FastifyInstance
let chgTestCaseNumber: string

beforeAll(async () => {
  server = await buildApp(fastify())
  await server.ready()

  await server.mongo.db.collection('chgItems').deleteMany()
  await server.mongo.db.collection('chgActivityLog').deleteMany()
  await server.mongo.db.collection('chgNotes').deleteMany()
  await server.mongo.db.collection('chgDefaults').deleteMany()

  await server.mongo.db.collection('misc').deleteMany( { name: { $regex: /numberChg/ } } )
  await server.mongo.db.collection('misc').insertOne({name: 'numberChgLen', value: 7, system: true})
  await server.mongo.db.collection('misc').insertOne({name: 'numberChg', value: 0, system: true})
})

afterAll(async () => {
  // called once after all tests run
  await server.close()
})

describe('change - basic tests', () => {

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

  describe('change', () => {

    test('create', async() => {

      // total length of numbers
      const {value: valueLen } = await server.mongo.db.collection('misc').findOne({ name: 'numberChgLen' })
      // get number
      let {value: currentNumber} = await server.mongo.db.collection('misc').findOne({ name: 'numberChg' })
      // increase count by one
      currentNumber++
      // update the database
      await server.mongo.db.collection('misc').updateOne({ name: 'numberChg' }, { $set: { value: currentNumber } })
      // cs number
      const chgNUmber = zeroPad(currentNumber, valueLen)

      const gql = graphqlMutation('chgCreate',  ['number', 'result'],{
        'required': { value: {
            number: `CHG${chgNUmber}`,
            user: '0000001',
            requester: '0000001',
            category: 'Hardware',
            channel: 'SELF_SERVE',
            impact: 'LOW',
            urgency: 'LOW',
            risk: 'LOW',
            shortDescription: 'Hello, World!',
            description: 'Foo Bar'},
          type: 'CHGRequiredFields',
          required: true
        }
      })
      server.log.debug(gql, 'CHG:UNIT TEST:CREATE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { chgCreate: { result: boolean } }}>().data.chgCreate.result).toBe(true)
      expect(result.json<{ data: { chgCreate: { number: string } }}>().data.chgCreate.number).toBe('CHG0000001')

      chgTestCaseNumber = result.json<{ data: { chgCreate: { number: string } }}>().data.chgCreate.number

      await checkCase(server, 'chgQuery',chgTestCaseNumber, 'state', CHGState.NEW)

    })

    test('query - all', async () => {

      const gql = graphqlQuery('chgQuery', ['number'])
      server.log.debug(gql, 'CHG:UNIT TEST:QUERY :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { chgQuery: [{ number: string}] }}>().data.chgQuery[0].number).toBe("CHG0000001")

    })

    test('query - single', async () => {

      const gql = graphqlQuery('chgQuery', ['number'], {
        'number': { value: chgTestCaseNumber }
      })
      server.log.debug(gql, 'CHG:UNIT TEST:QUERY SINGLE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { chgQuery: [{ number: string}] }}>().data.chgQuery[0].number).toBe("CHG0000001")
      expect(result.json<{ data: { chgQuery: [{ number: string}] }}>().data.chgQuery.length).toBe(1)

    })

    test('add note', async () => {

      const gql = graphqlMutation('chgCreateNote',  [],{
        'number': { value: chgTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'note', required: true },
        'note': { value: 'New Note', required: true }
      })
      server.log.debug(gql, 'CHG:UNIT TEST:CREATE NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { chgCreateNote: boolean }}>().data.chgCreateNote).toBe(true)

    })

    test('add work node', async () => {
      const gql = graphqlMutation('chgCreateNote', [],{
        'number': { value: chgTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
        'user': { value: `0000001`, required: true },
        'type': { value: 'workNote', required: true },
        'note': { value: 'New Work Note', required: true }
      })
      server.log.debug(gql, 'CHG:UNIT TEST:CREATE WORK NOTE :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { chgCreateNote: boolean }}>().data.chgCreateNote).toBe(true)
    })

  })

  describe('actions: state', () => {

    test('state: starting at NEW', async () => {
      await checkCase(server, 'chgQuery', chgTestCaseNumber, 'state', CHGState.NEW)
    })

    ;["APPROVAL_WAITING","APPROVAL_CAB","SCHEDULED","IN_PROGRESS","REVIEW","CLOSED"].forEach(state => {

      test(`state: change to --> ${state}`, async () => {

        const gql = graphqlMutation('chgModifyField', [], {
          'number': {value: chgTestCaseNumber, required: true},
          'field': {value: ['state'], type: '[String!]', required: true},
          'user': {value: `0000001`, required: true},
          'input': {value: {state}, type: 'CHGModifyFields', required: true},
        })
        server.log.debug(gql, 'CHG:UNIT TEST:UPDATE FIELD - STATE - NEW --> ASSESS  :: GQL')

        const result = await server.inject({
          method: "POST",
          body: gql,
          path: "/graphql"
        })
        expect(result.json<{ data: { chgModifyField: boolean } }>().data.chgModifyField).toBe(true)

        await checkCase(server, 'chgQuery', chgTestCaseNumber, 'state', CHGState[state])

      })

    })

    test('state: CLOSED --> NEW (fail)', async () => {

      const gql = graphqlMutation('chgModifyField', [], {
        'number': {value: chgTestCaseNumber, required: true},
        'field': {value: ['state'], type: '[String!]', required: true},
        'user': {value: `0000001`, required: true},
        'input': {value: {state: 'NEW'}, type: 'CHGModifyFields', required: true},
      })

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ errors: [{ message: string}] }>().errors[0].message).toBe("Unable to change the state. Not allowed from current state.")
      await checkCase(server, 'chgQuery', chgTestCaseNumber, 'state', CHGState.CLOSED)

    })


  })

})