import { prisma } from './src/lib/db';

async function openShift() {
  try {
    const hotelId = 'SFB-99';
    
    const activeShift = await prisma.shift.findFirst({
      where: {
        hotelId,
        status: 'OPEN'
      }
    });

    if (!activeShift) {
      console.log('Opening new shift for SFB-99...');
      await prisma.shift.create({
        data: {
          hotelId,
          status: 'OPEN',
          startTime: new Date()
        }
      });
      console.log('Shift opened successfully.');
    } else {
      console.log('Shift is already open.');
    }
  } catch (err) {
    console.error('Error opening shift:', err);
  } finally {
    await prisma.$disconnect();
  }
}

openShift();
