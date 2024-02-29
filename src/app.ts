import {fileURLToPath} from "node:url";
import { join, dirname } from 'path'
import AutoLoad from '@fastify/autoload'
import {FastifyServerOptions, FastifyInstance} from 'fastify'

const fileName = fileURLToPath(import.meta.url)
const dirName = dirname(fileName)

export default async (fastify: FastifyInstance, opts?: FastifyServerOptions) => {
  void fastify.register(AutoLoad, {
    dir: join(dirName, 'plugins'),
    options: opts
  })

  return fastify
}
