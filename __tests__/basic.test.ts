import fastify, {FastifyInstance } from "fastify";
import {describe, test, beforeEach, afterEach, expect } from 'vitest';
import buildApp from '../src/app'
import csCreate from "./__fixtures__/grpahql/mutation/csCreate";

let server: FastifyInstance

beforeEach(async () => {
  server = await buildApp(fastify())
  await server.ready()
})
afterEach(async () => {
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

      const result = await server.inject({
        method: "POST",
        body: csCreate(),
        path: "/graphql"
      })

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