import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { CurtainService } from './app/modules/curtain/curtain.service';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('🍃 MongoDB connected successfully to Curtainz Studio database!');

    // Automatically seed fabric catalog if empty
    try {
      const seedResult = await CurtainService.seedCurtainsIntoDB();
      if (seedResult.seeded) {
        console.log(`✨ Seeded ${seedResult.count} initial curtains and fabrics.`);
      }
    } catch (seedErr) {
      console.warn('Seed notice:', seedErr);
    }

    server = app.listen(config.port, () => {
      console.log(`🚀 Curtainz Backend Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unhandledRejection detected:`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log(`😈 uncaughtException detected:`, err);
  process.exit(1);
});
