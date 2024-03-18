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

  await server.mongo.db.collection('misc').deleteMany( { name: { $regex: /numberPro/ } } )
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

      // total length of numbers
      const {value: valueLen } = await server.mongo.db.collection('misc').findOne({ name: 'numberPrbLen' })
      // get number
      let {value: currentNumber} = await server.mongo.db.collection('misc').findOne({ name: 'numberPrb' })
      // increase count by one
      currentNumber++
      // update the database
      await server.mongo.db.collection('misc').updateOne({ name: 'numberPrb' }, { $set: { value: currentNumber } })
      // cs number
      const incNUmber = zeroPad(currentNumber, valueLen)

      const gql = graphqlMutation('prbCreate',  ['number', 'result'],{
        'required': { value: {
            number: `PRB${incNUmber}`,
            initialReport: 'INC0000001',
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
      expect(result.json<{ data: { prbCreate: { number: string } }}>().data.prbCreate.number).toBe('PRB0000001')

      prbTestCaseNumber = result.json<{ data: { prbCreate: { number: string } }}>().data.prbCreate.number

      await checkCase(server, 'incQuery',prbTestCaseNumber, 'state', PRBState.NEW)

    })

    test('query - all', async () => {

      const gql = graphqlQuery('prbQuery', ['number'])
      server.log.debug(gql, 'PRB:UNIT TEST:QUERY :: GQL')

      const result = await server.inject({
        method: "POST",
        body: gql,
        path: "/graphql"
      })
      expect(result.json<{ data: { prbQuery: [{ number: string}] }}>().data.prbQuery[0].number).toBe("PRB0000001")

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
      expect(result.json<{ data: { prbQuery: [{ number: string}] }}>().data.prbQuery[0].number).toBe("PRB0000001")
      expect(result.json<{ data: { prbQuery: [{ number: string}] }}>().data.prbQuery.length).toBe(1)

    })

    test('add note', async () => {

      const gql = graphqlMutation('prbCreateNote', [],{
        'number': { value: prbTestCaseNumber, required: true },
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
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
        'channel': { value: 'WEB', type: "GlobalChannel", required: true },
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

  })

})