import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { CurtainService } from './app/modules/curtain/curtain.service';
import { User } from './app/modules/user/user.model';

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
      console.warn('Fabric seed notice:', seedErr);
    }

    // Automatically seed default Admin user if none exists
    try {
      const existingAdmin = await User.findOne({ email: 'admin@curtainz.ai' });
      if (!existingAdmin) {
        await User.create({
          name: 'Curtainz Studio Admin',
          email: 'admin@curtainz.ai',
          password: 'admin123456',
          role: 'admin',
          phone: '+971 52 313 5707',
          location: 'Dubai Design District (d3), UAE',
          bio: 'Chief Store Administrator for Curtainz Studio Dubai',
          status: 'active',
        });
        console.log('👑 Default Admin user created: admin@curtainz.ai / admin123456');
      }
    } catch (adminErr) {
      console.warn('Admin seed notice:', adminErr);
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
