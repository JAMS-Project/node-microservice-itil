import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'

let server: FastifyInstance
let csTestCaseNumber: string = `INC0000001`

beforeAll(async () => {
  server = await buildApp(fastify())
  await server.ready()

  await server.mongo.db.collection('incItems').deleteMany()
  await server.mongo.db.collection('incActivityLog').deleteMany()
  await server.mongo.db.collection('incNotes').deleteMany()

  await server.mongo.db.collection('misc').deleteMany( { name: { $regex: /numberInc/ } } )
  await server.mongo.db.collection('misc').insertOne({name: 'numberIncLen', value: 7, system: true})
  await server.mongo.db.collection('misc').insertOne({name: 'numberInc', value: 0, system: true})
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

})