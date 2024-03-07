import {fastifyAutoload} from "@fastify/autoload";
import {fileURLToPath} from "node:url";
import { join, dirname } from 'path'
import {FastifyServerOptions, FastifyInstance} from 'fastify'

const fileName = fileURLToPath(import.meta.url)
const dirName = dirname(fileName)

export default async (fastify: FastifyInstance, opts?: FastifyServerOptions) => {
  // @ts-ignore until https://github.com/fastify/fastify-autoload/issues/366 is closed
  void fastify.register(fastifyAutoload, {
    dir: join(dirName, 'plugins'),
    options: opts
  })

  return fastify
}
