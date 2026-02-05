import { FastifyInstance, RegisterOptions } from 'fastify';
import himovies from './himovies';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  await fastify.register(himovies, { prefix: '/himovies' });

  fastify.get('/', async (request: any, reply: any) => {
    reply.status(200).send('Welcome to Consumet Movies (HiMovies Only)');
  });
};

export default routes;
