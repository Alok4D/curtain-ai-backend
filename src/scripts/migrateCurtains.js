const mongoose = require('mongoose');

const uri =
  'mongodb+srv://ai-curtain-studio:adVQacNLX3smQnRO@cluster0.1yjndj5.mongodb.net/ai-curtain-studio?retryWrites=true&w=majority';

async function migrate() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const collection = mongoose.connection.collection('curtains');
  const curtains = await collection.find({}).toArray();
  console.log('Found', curtains.length, 'curtains in DB');

  let updatedCount = 0;
  for (const c of curtains) {
    const name = (c.name || '').toLowerCase();
    const material = (c.material || '').toLowerCase();
    const cat = c.category || 'curtains';

    // Derive colors
    const colors = [];
    if (name.includes('blue')) colors.push('blue');
    if (name.includes('red')) colors.push('red', 'crimson');
    if (
      name.includes('white') ||
      name.includes('arctic') ||
      name.includes('ice') ||
      name.includes('pearl')
    )
      colors.push('white', 'off-white');
    if (name.includes('cream') || name.includes('breeze'))
      colors.push('cream', 'ivory');
    if (
      name.includes('sand') ||
      name.includes('biscotti') ||
      name.includes('caramel')
    )
      colors.push('beige', 'caramel');
    if (name.includes('moss') || name.includes('olive'))
      colors.push('olive', 'sage');
    if (name.includes('mustard')) colors.push('mustard', 'gold');
    if (name.includes('plum')) colors.push('plum', 'purple');
    if (name.includes('chestnut')) colors.push('brown', 'chestnut');
    if (
      name.includes('grey') ||
      name.includes('gray') ||
      name.includes('denim')
    )
      colors.push('grey', 'slate');
    if (colors.length === 0) colors.push('beige', 'cream');

    // Derive fabric
    let fabric = 'linen';
    if (
      material.includes('linen') ||
      name.includes('lenin') ||
      name.includes('linen')
    )
      fabric = 'linen';
    else if (material.includes('velvet') || name.includes('velvet'))
      fabric = 'velvet';
    else if (material.includes('silk') || name.includes('silk')) fabric = 'silk';
    else if (material.includes('voile') || name.includes('voile'))
      fabric = 'voile';
    else if (cat === 'rollers') fabric = 'polyester';

    // Derive pattern
    let pattern = 'plain';
    if (
      name.includes('stripe') ||
      name.includes('line') ||
      name.includes('zebra')
    )
      pattern = 'striped';
    else if (
      name.includes('geometric') ||
      name.includes('chain') ||
      name.includes('webs')
    )
      pattern = 'geometric';
    else if (name.includes('texture') || name.includes('basketweave'))
      pattern = 'textured';

    // Derive opacity
    let opacity = 'semi-sheer';
    if (cat === 'sheers' || name.includes('sheer')) opacity = 'sheer';
    else if (
      name.includes('blackout') ||
      material.includes('blackout') ||
      cat === 'rollers'
    )
      opacity = 'blackout';

    // Derive texture
    let texture = 'natural linen';
    if (material.includes('weave')) texture = 'textured weave';
    else if (cat === 'sheers') texture = 'airy sheer';
    else if (cat === 'rollers') texture = 'smooth blackout';

    // Suitable rooms
    const suitableRooms =
      cat === 'rollers'
        ? ['bedroom', 'office']
        : cat === 'sheers'
          ? ['living-room', 'dining-room']
          : ['living-room', 'bedroom'];

    // Images array
    const images = [];
    if (c.display_image_url) images.push(c.display_image_url);
    if (c.image_url && !images.includes(c.image_url)) images.push(c.image_url);

    const updateDoc = {
      $set: {
        category: cat,
        colors: c.colors && c.colors.length > 0 ? c.colors : colors,
        fabric: c.fabric || fabric,
        pattern: c.pattern || pattern,
        style:
          c.style && c.style.length > 0 ? c.style : ['modern', 'minimalist'],
        opacity: c.opacity || opacity,
        texture: c.texture || texture,
        suitableRooms:
          c.suitableRooms && c.suitableRooms.length > 0
            ? c.suitableRooms
            : suitableRooms,
        images: c.images && c.images.length > 0 ? c.images : images,
        isActive: c.isActive !== undefined ? c.isActive : true,
      },
    };

    await collection.updateOne({ _id: c._id }, updateDoc);
    updatedCount++;
  }

  console.log(
    'Successfully updated',
    updatedCount,
    'curtains with new schema fields!',
  );
  await mongoose.disconnect();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});

