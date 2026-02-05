require('dotenv').config();
import Redis from 'ioredis';
import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import movies from './routes/movies';
import chalk from 'chalk';
import Utils from './utils';

export const redis =
  process.env.REDIS_HOST &&
  new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

// Sets default TTL to 1 hour (3600 seconds) if not provided in .env
export const REDIS_TTL = Number(process.env.REDIS_TTL) || 3600;

const fastify = Fastify({
  maxParamLength: 1000,
  logger: true,
});

(async () => {
  const PORT = Number(process.env.PORT) || 3000;

  await fastify.register(FastifyCors, {
    origin: '*',
    methods: 'GET',
  });

  console.log(chalk.green(`Starting server on port ${PORT}... 🚀`));
  if (!process.env.REDIS_HOST) {
    console.warn(chalk.yellowBright('Redis not found. Cache disabled.'));
  } else {
    console.log(chalk.green(`Redis connected. Default Cache TTL: ${REDIS_TTL} seconds`));
  }

  await fastify.register(movies, { prefix: '/movies' });
  await fastify.register(Utils, { prefix: '/utils' });

  try {
    fastify.get('/', (_, rp) => {
      rp.status(200).send('Welcome to simplified Consumet API (HiMovies Only) 🎉');
    });
    fastify.get('*', (request, reply) => {
      reply.status(404).send({
        message: '',
        error: 'page not found',
      });
    });

    fastify.listen({ port: PORT, host: '0.0.0.0' }, (e, address) => {
      if (e) throw e;
      console.log(`server listening on ${address}`);
    });
  } catch (err: any) {
    fastify.log.error(err);
    process.exit(1);
  }
})();

export default async function handler(req: any, res: any) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
