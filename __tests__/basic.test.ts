import AutoLoad from "@fastify/autoload";
import fastify, {FastifyInstance } from "fastify";
import customHealthCheck from "fastify-custom-healthcheck";
import {fileURLToPath} from "node:url";
import {dirname, join} from "path";
import {describe, test, beforeEach, afterEach, expect } from 'vitest';
import buildApp from '../src/app'

const fileName = fileURLToPath(import.meta.url)
const dirName = dirname(fileName)

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
      server.log.debug('Test')

      const result = await server.inject({
        path: "/health"
      })
      console.log(result)

    })

    test.todo('health checks good - basic')

    test.todo('health checks good - rabbitmq')

    test.todo('health checks good - mongodb')

  })

  describe('cs', () => {

    test.todo('create')

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