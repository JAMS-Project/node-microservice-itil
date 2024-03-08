import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'
import {IMiscResult} from "../src/declaration/interfaces";
import {zeroPad} from "../src/helpers/utils";
import graphqlMutation from "./__fixtures__/graphqlMutation";

let server: FastifyInstance

beforeAll(async () => {
  server = await buildApp(fastify())

  await server.ready()

  // create defaults
  await server.mongo.db?.collection('misc').deleteMany()
  await server.mongo.db?.collection('cs').deleteMany()
  await server.mongo.db?.collection('activityLog').deleteMany()

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

describe('itil - basic tests', () => {

  describe('fastify', () => {

    test('graphql is available', async async => {
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
      const {value: valueLen } = await server.mongo.db?.collection('misc').findOne({ name: 'numberCsLen' }) as IMiscResult<number>
      // get number
      let {value: currentNumber} = await server.mongo.db?.collection('misc').findOne({ name: 'numberCs' }) as IMiscResult<number>
      // increase count by one
      currentNumber++
      // update the database
      await server.mongo.db?.collection('misc').updateOne({ name: 'numberCs' }, { $set: { value: currentNumber } })
      // zeroPad the value
      const valueString = zeroPad(currentNumber, valueLen)

      const gql = graphqlMutation('csCreate', {
          'number': { value: `CS${valueString}`, required: true },
          'channel': {
            value: 'SELFSERVE',
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
      console.log(result.body)

    })

    test.todo('query')

    test.todo('add comment')

    test.todo('add work node')

    describe('actions', () => {

      test.todo('state: new --> in progress')

      test.todo('state: in progress --> on hold, awaiting caller')

      test.todo('state: on hold, awaiting caller --> in progress')

      test.todo('state: in progress --> proposed solution')

      test.todo('state: proposed solution --> rejected --> in progress')

      test.todo('state: proposed solution --> accepted --> resolved')

      test.todo('state: resolved --> closed')

    })

  })

  describe('incident', () => {

    test.todo('create')

    test.todo('query')

    test.todo('copy with new incident number')

    test.todo('add comment')

    test.todo('add work node')

    describe('actions', () => {

      test.todo('state: new --> in progress')

      test.todo('state: in progress --> on hold, awaiting caller')

      test.todo('state: in progress --> on hold, awaiting vendor')

      test.todo('state: in progress --> on hold, awaiting scheduling')

      test.todo('state: on hold --> in progress, clear on hold reason')

      test.todo('state: in progress --> resolved, perm')

      test.todo('state: resolved --> closed')

    })

  })

  describe('problem', () => {

    test.todo('create')

    test.todo('create from incident')

  })

  describe('change', () => {

    test.todo('create')

  })

})