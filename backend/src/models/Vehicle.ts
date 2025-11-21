import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle {
    year: number;
    make: string;
    model: string;
    mpg_combined: number;
    mpg_city?: number;
    mpg_highway?: number;
    fuel_type?: string;
    cylinders?: number;
    displacement?: number;
    transmission?: string;
    drive_type?: string;
}

const VehicleSchema: Schema = new Schema({
    year: { type: Number, required: true, index: true },
    make: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    mpg_combined: { type: Number, required: true },
    mpg_city: { type: Number },
    mpg_highway: { type: Number },
    fuel_type: { type: String },
    cylinders: { type: Number },
    displacement: { type: Number },
    transmission: { type: String },
    drive_type: { type: String },
});

// Compound index for efficient lookups
VehicleSchema.index({ year: 1, make: 1, model: 1 }, { unique: true });

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
