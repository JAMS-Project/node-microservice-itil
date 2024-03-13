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

    test.todo('create')

  })

})