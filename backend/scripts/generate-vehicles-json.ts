import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

// Try to find CSV in root or backend directory
const CSV_PATH = path.join(process.cwd(), 'vehicles.csv');
// Output to backend/data for deployment, but also try root data/ for development
const OUTPUT_PATH = path.join(process.cwd(), 'backend/data/vehicles.json');
const ROOT_OUTPUT_PATH = path.join(process.cwd(), 'data/vehicles.json');

interface Vehicle {
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

console.log('Reading CSV file...');
const csvContent = readFileSync(CSV_PATH, 'utf-8');

console.log('Parsing CSV...');
const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
});

console.log(`Processing ${records.length} records...`);

// Filter and process vehicles
const vehicles: Vehicle[] = records
    .filter((record: any) => {
        const year = parseInt(record.year);
        const mpgCombined = record.comb08 ? parseFloat(record.comb08) : null;
        return year >= 2010 && year <= 2026 && record.make && record.model && mpgCombined && mpgCombined > 0;
    })
    .map((record: any): Vehicle => {
        const vehicle: Vehicle = {
            year: parseInt(record.year),
            make: record.make.trim(),
            model: record.model.trim(),
            mpg_combined: parseFloat(record.comb08),
        };
        
        if (record.city08) vehicle.mpg_city = parseInt(record.city08);
        if (record.highway08) vehicle.mpg_highway = parseInt(record.highway08);
        if (record.fuelType1 || record.fuelType) vehicle.fuel_type = (record.fuelType1 || record.fuelType).trim();
        if (record.cylinders) vehicle.cylinders = parseInt(record.cylinders);
        if (record.displ) vehicle.displacement = parseFloat(record.displ);
        if (record.trans_dscr || record.trany) vehicle.transmission = (record.trans_dscr || record.trany).trim();
        if (record.drive) vehicle.drive_type = record.drive.trim();
        
        return vehicle;
    });

console.log(`Filtered to ${vehicles.length} vehicles`);

// Organize into nested structure: year -> make -> model
const vehiclesData: VehiclesData = {
    years: [],
    vehicles: {}
};

vehicles.forEach(vehicle => {
    if (!vehiclesData.vehicles[vehicle.year]) {
        vehiclesData.vehicles[vehicle.year] = {};
    }
    if (!vehiclesData.vehicles[vehicle.year][vehicle.make]) {
        vehiclesData.vehicles[vehicle.year][vehicle.make] = {};
    }
    vehiclesData.vehicles[vehicle.year][vehicle.make][vehicle.model] = vehicle;
});

// Extract unique years and sort
vehiclesData.years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a);

// Ensure output directories exist
const outputDir = path.dirname(OUTPUT_PATH);
const rootOutputDir = path.dirname(ROOT_OUTPUT_PATH);
try {
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(rootOutputDir, { recursive: true });
} catch (e) {
    // Directory might already exist
}

console.log('Writing JSON file...');
const jsonContent = JSON.stringify(vehiclesData, null, 2);
writeFileSync(OUTPUT_PATH, jsonContent);
writeFileSync(ROOT_OUTPUT_PATH, jsonContent);

console.log(`✅ Generated ${OUTPUT_PATH}`);
console.log(`✅ Also generated ${ROOT_OUTPUT_PATH}`);
console.log(`   Years: ${vehiclesData.years.length}`);
console.log(`   Total vehicles: ${vehicles.length}`);

