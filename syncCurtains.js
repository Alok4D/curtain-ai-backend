const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

async function syncCurtains() {
  await mongoose.connect(process.env.DATABASE_URL);
  const data = JSON.parse(
    fs.readFileSync('e:/ai-curtain-studio/curtain-ai-frontend/data/curtains.json', 'utf8')
  );
  const curtainsCol = mongoose.connection.db.collection('curtains');

  let inserted = 0;
  let updated = 0;

  for (const cat of ['curtains', 'sheers', 'rollers']) {
    for (const item of data[cat]) {
      const res = await curtainsCol.updateOne(
        { id: item.id },
        {
          $set: {
            name: item.name,
            category: cat,
            image_url: item.image_url,
            display_image_url: item.display_image_url,
            isDeleted: false,
            inStock: true,
          },
          $setOnInsert: {
            material:
              cat === 'curtains'
                ? '100% Premium Belgian Linen'
                : cat === 'sheers'
                ? 'Light-filtering Voile Sheer'
                : 'Textured Thermal Blackout',
            price: cat === 'curtains' ? 195 : cat === 'sheers' ? 155 : 175,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      if (res.upsertedCount > 0) inserted++;
      else updated++;
    }
  }

  console.log('Sync complete! Inserted:', inserted, 'Updated:', updated);
  const total = await curtainsCol.countDocuments({ isDeleted: false });
  console.log('Total active curtains in DB:', total);
  await mongoose.disconnect();
}

syncCurtains().catch(console.error);

