import Fastify from 'fastify';

const fastify = Fastify({
  logger: true
});

/** @type {import('fastify').RouteShorthandOptions} */
const helloWorldOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
};

fastify.get('/', helloWorldOptions, async () => {
  return { message: 'Hello World' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
