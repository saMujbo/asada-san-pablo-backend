import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { seedProjectStates } from './catalogs/project-states.seeder';
import { seedReportStates } from './catalogs/report-states.seeder';
import { seedReportTypes } from './catalogs/report-types.seeder';
import { seedRoles } from './catalogs/roles.seeder';
import { seedStateRequests } from './catalogs/state-request.seeder';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);

    const seeders = [
      { name: 'roles', execute: seedRoles },
      { name: 'report-types', execute: seedReportTypes },
      { name: 'report-states', execute: seedReportStates },
      { name: 'state-request', execute: seedStateRequests },
      { name: 'project-state', execute: seedProjectStates },
    ];

    for (const seeder of seeders) {
      const result = await seeder.execute(dataSource);
      console.log(
        `[seed:${seeder.name}] inserted=${result.inserted} updated=${result.updated}`,
      );
    }

    console.log('Catalog seeders completed successfully.');
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error('Catalog seeders failed.', error);
  process.exit(1);
});
