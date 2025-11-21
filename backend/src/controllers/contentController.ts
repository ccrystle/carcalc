import { FastifyRequest, FastifyReply } from 'fastify';
import Content from '../models/Content';

export const getContent = async (req: FastifyRequest<{ Params: { key: string } }>, reply: FastifyReply) => {
    try {
        const { key } = req.params;
        const content = await Content.findOne({ key });
        if (!content) {
            return reply.status(404).send({ message: 'Content not found' });
        }
        return content;
    } catch (error) {
        return reply.status(500).send({ message: 'Error fetching content', error });
    }
};

export const updateContent = async (req: FastifyRequest<{ Params: { key: string }; Body: { content: string } }>, reply: FastifyReply) => {
    try {
        const { key } = req.params;
        const { content } = req.body;

        const updatedContent = await Content.findOneAndUpdate(
            { key },
            { content, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        return updatedContent;
    } catch (error) {
        return reply.status(500).send({ message: 'Error updating content', error });
    }
};

export const getAllContent = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const allContent = await Content.find({});
        return allContent;
    } catch (error) {
        return reply.status(500).send({ message: 'Error fetching all content', error });
    }
};
