import { readFileSync } from 'fs';
import path from 'path';

export interface Vehicle {
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

interface VehiclesData {
    years: number[];
    vehicles: Record<number, Record<string, Record<string, Vehicle>>>;
}

let vehiclesData: VehiclesData | null = null;

export const loadVehicleData = (): VehiclesData => {
    if (vehiclesData) {
        return vehiclesData;
    }

    // Try multiple possible paths
    const possiblePaths = [
        // Production path (compiled JS in dist/)
        path.join(__dirname, '../../data/vehicles.json'),
        // Development path (from src/)
        path.join(__dirname, '../../../data/vehicles.json'),
        // Root data folder
        path.join(process.cwd(), 'data/vehicles.json'),
        // Backend data folder
        path.join(process.cwd(), 'backend/data/vehicles.json'),
    ];

    for (const dataPath of possiblePaths) {
        try {
            const fileContent = readFileSync(dataPath, 'utf-8');
            vehiclesData = JSON.parse(fileContent);
            console.log(`✅ Loaded vehicle data from ${dataPath}: ${vehiclesData!.years.length} years`);
            return vehiclesData!;
        } catch (error) {
            // Try next path
            continue;
        }
    }

    throw new Error('Vehicle data file not found. Tried paths: ' + possiblePaths.join(', '));
};

export const getYears = (): number[] => {
    const data = loadVehicleData();
    return [...data.years];
};

export const getMakes = (year: number): string[] => {
    const data = loadVehicleData();
    const yearData = data.vehicles[year];
    if (!yearData) {
        return [];
    }
    return Object.keys(yearData).sort();
};

export const getModels = (year: number, make: string): Vehicle[] => {
    const data = loadVehicleData();
    const yearData = data.vehicles[year];
    if (!yearData) {
        return [];
    }
    const makeData = yearData[make];
    if (!makeData) {
        return [];
    }
    return Object.values(makeData)
        .map(vehicle => ({ ...vehicle }))
        .sort((a, b) => a.model.localeCompare(b.model));
};

