import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'path'
import { FastifyServerOptions, FastifyInstance } from 'fastify'

const fileName = fileURLToPath(import.meta.url)
const dirName = dirname(fileName)

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {
  // Place your custom options for app below here.
}

const options: AppOptions = {
  logger: {
    name: 'node-microservice-itil'
  }
}

export default async (fastify: FastifyInstance, opts?: FastifyServerOptions): Promise<FastifyInstance> => {
  void fastify.register(AutoLoad, {
    dir: join(dirName, 'plugins'),
    options: opts
  })

  return fastify
}

export { options }
