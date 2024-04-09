import {FastifyInstance} from "fastify";
import {expect} from "vitest";
import graphqlQuery from "../__fixtures__/graphqlQuery";

export const checkCase = async (server: FastifyInstance, query: string, number: string, field: string, expectedValue: string | number | boolean) => {
  const result = await server.inject({
    method: "POST",
    body: graphqlQuery(query, [field], {
      'number': { value: number }
    }),
    path: "/graphql"
  })
  expect(result.json<{ [query: string]: { csQuery: [{ [`field`]: string | number | boolean}] }}>().data[query][0][field.trim()]).toEqual(expectedValue)
  expect(result.json<{ [query: string]: { csQuery: [] }}>().data[query].length).toBe(1)
}