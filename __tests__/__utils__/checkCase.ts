import {FastifyInstance} from "fastify";
import {expect} from "vitest";
import graphqlQuery from "../__fixtures__/graphqlQuery";

export const checkCase = async (server: FastifyInstance, number: string, field: string, expectedValue: string | number | boolean) => {
  const result = await server.inject({
    method: "POST",
    body: graphqlQuery('csQuery', [field], {
      'number': { value: number }
    }),
    path: "/graphql"
  })
  expect(result.json<{ data: { csQuery: [{ [`field`]: string | number | boolean}] }}>().data.csQuery[0][field.trim()]).toEqual(expectedValue)
  expect(result.json<{ data: { csQuery: [] }}>().data.csQuery.length).toBe(1)
}