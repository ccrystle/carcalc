import { FastifyRequest, FastifyReply } from 'fastify';
import * as vehicleDataService from '../services/vehicleDataService';

export const getYears = async (req: FastifyRequest, reply: FastifyReply) => {
    return vehicleDataService.getYears();
};

export const getMakes = async (req: FastifyRequest<{ Params: { year: string } }>, reply: FastifyReply) => {
    const { year } = req.params;
    return vehicleDataService.getMakes(parseInt(year));
};

export const getModels = async (req: FastifyRequest<{ Params: { year: string; make: string } }>, reply: FastifyReply) => {
    const { year, make } = req.params;
    return vehicleDataService.getModels(parseInt(year), make);
};
