import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { Vehicle } from '../models/Vehicle';

const EPA_CSV_URL = 'https://fueleconomy.gov/feg/epadata/vehicles.csv';

export const syncEpaVehicles = async () => {
    console.log('Downloading EPA CSV data...');
    const response = await axios.get(EPA_CSV_URL);

    console.log('Parsing CSV data...');
    const records = parse(response.data, {
        columns: true,
        skip_empty_lines: true
    });

    console.log(`Parsed ${records.length} total vehicles`);

    const vehicles = records
        .filter((record: any) => {
            const year = parseInt(record.year);
            return year >= 2010 && year <= 2026 && record.make && record.model;
        })
        .map((record: any) => ({
            year: parseInt(record.year),
            make: record.make.trim(),
            model: record.model.trim(),
            mpg_combined: record.comb08 ? parseFloat(record.comb08) : null,
            mpg_city: record.city08 ? parseInt(record.city08) : null,
            mpg_highway: record.highway08 ? parseInt(record.highway08) : null,
            fuel_type: record.fuelType1 || record.fuelType || null,
            cylinders: record.cylinders ? parseInt(record.cylinders) : null,
            displacement: record.displ ? parseFloat(record.displ) : null,
            transmission: record.trans_dscr || record.trany || null,
            drive_type: record.drive || null,
        }))
        .filter((v: any) => v.mpg_combined && v.mpg_combined > 0);

    console.log(`Filtered to ${vehicles.length} vehicles (2010-2026)`);

    // Bulk upsert
    const operations = vehicles.map((vehicle: any) => ({
        updateOne: {
            filter: { year: vehicle.year, make: vehicle.make, model: vehicle.model },
            update: { $set: vehicle },
            upsert: true
        }
    }));

    // Execute in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        await Vehicle.bulkWrite(batch);
        console.log(`Processed batch ${i / batchSize + 1}`);
    }

    console.log('EPA data sync complete');
    return { total: vehicles.length };
};
