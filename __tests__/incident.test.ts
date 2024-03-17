import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'
import {GlobalChannel, INCState} from "../src/declaration/enum";
import graphqlMutation from "./__fixtures__/graphqlMutation";
import graphqlQuery from "./__fixtures__/graphqlQuery";
import {checkCase} from "./__utils__/checkCase";


let server: FastifyInstance
let incTestCaseNumber: string = `INC0000001`

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

      const gql = graphqlMutation('incCreate', {
        'required': { value: {
          number: 'INC0000001',
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
      expect(result.json<{ data: { incCreate: boolean }}>().data.incCreate).toBe(true)

      await checkCase(server, 'incQuery',incTestCaseNumber, 'state', INCState.NEW)

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

      const gql = graphqlMutation('incCreateNote', {
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
      const gql = graphqlMutation('incCreateNote', {
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

      test.todo('... to a new incident')

    })

    describe('actions: create', () => {

      test.todo('... child')

      test.todo('... problem')

      test.todo('... change')

      test.todo('... problem')

      test.todo('... task')

    })



    test.todo('new incident to another incident as a child')

    describe('actions: state', () => {

      test.todo('state: new --> in progress')

      test.todo('state: in progress --> on hold, awaiting caller')

      test.todo('state: in progress --> on hold, awaiting vendor')

      test.todo('state: in progress --> on hold, awaiting scheduling')

      test.todo('state: on hold --> in progress, clear on hold reason')

      test.todo('state: in progress --> resolved, perm')

      test.todo('state: resolved --> closed')

    })

    describe('actions: sub-applications', () => {

      test.todo('... outage')

      test.todo('... communication')

      describe('major incident', () => {

        test.todo('... proposed')

        test.todo('... promote')

      })

    })

  })

})