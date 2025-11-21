import { FastifyRequest, FastifyReply } from 'fastify';
import { Vehicle } from '../models/Vehicle';
import { syncEpaVehicles } from '../services/epaService';

export const getYears = async (req: FastifyRequest, reply: FastifyReply) => {
    const years = await Vehicle.distinct('year');
    return years.sort((a, b) => b - a);
};

export const getMakes = async (req: FastifyRequest<{ Params: { year: string } }>, reply: FastifyReply) => {
    const { year } = req.params;
    const makes = await Vehicle.find({ year: parseInt(year) }).distinct('make');
    return makes.sort();
};

export const getModels = async (req: FastifyRequest<{ Params: { year: string; make: string } }>, reply: FastifyReply) => {
    const { year, make } = req.params;
    const models = await Vehicle.find({ year: parseInt(year), make }).select('model mpg_combined').sort('model');
    return models;
};

export const syncVehicles = async (req: FastifyRequest, reply: FastifyReply) => {
    // In a real app, protect this with admin auth
    const result = await syncEpaVehicles();
    return result;
};
