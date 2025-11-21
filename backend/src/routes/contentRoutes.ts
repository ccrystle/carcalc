import { FastifyInstance } from 'fastify';
import { getContent, updateContent, getAllContent } from '../controllers/contentController';

export default async function contentRoutes(fastify: FastifyInstance) {
    fastify.get('/', getAllContent);
    fastify.get('/:key', getContent);
    fastify.post('/:key', updateContent);
}
