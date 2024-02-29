import fp from 'fastify-plugin'
import customHealthCheck, { CustomHealthCheckOptions } from 'fastify-custom-healthcheck'

export default fp<CustomHealthCheckOptions>(async (fastify) => {
  void fastify.register(customHealthCheck)

  void fastify.ready().then(() => {
    fastify.log.debug('[node-microservice-itil-health] Started Health')
  })
})
