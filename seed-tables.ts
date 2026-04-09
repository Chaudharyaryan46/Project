import { prisma } from './src/lib/db';

async function seed() {
  try {
    const hotelId = 'SFB-99';
    
    // Ensure hotel exists
    await prisma.hotel.upsert({
      where: { id: hotelId },
      update: {},
      create: {
        id: hotelId,
        name: 'Saffron Bay',
        slug: 'saffron-bay',
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }
    });

    // Delete existing tables for this hotel to be clean
    await prisma.table.deleteMany({
      where: { hotelId: hotelId }
    });

    console.log('Resetting tables to 15...');

    for (let i = 1; i <= 15; i++) {
      const tableNumber = i.toString();
      await prisma.table.create({
        data: {
          id: `T${i}`,
          number: tableNumber,
          capacity: 4,
          hotelId: hotelId
        }
      });
    }

    console.log('Successfully created 15 tables.');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
