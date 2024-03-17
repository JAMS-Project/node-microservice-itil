import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeAll, afterAll, expect } from 'vitest';
import buildApp from '../src/app'

let server: FastifyInstance

beforeAll(async () => {
  server = await buildApp(fastify())
  await server.ready()

  await server.mongo.db.collection('misc').deleteMany( { name: { $regex: /numberPro/ } } )
  await server.mongo.db.collection('misc').insertOne({name: 'numberPrbLen', value: 7, system: true})
  await server.mongo.db.collection('misc').insertOne({name: 'numberPrb', value: 0, system: true})
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

    test.todo('create')

    test.todo('create from incident')

  })

})