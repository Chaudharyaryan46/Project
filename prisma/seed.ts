import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seeding Process ---');

  // 1. Create a Hotel
  const hotel = await prisma.hotel.upsert({
    where: { slug: 'grand-royal' },
    update: {},
    create: {
      name: 'The Grand Royal',
      slug: 'grand-royal',
      address: '123 Luxury Lane, Food City',
      phone: '+1234567890',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true,
    },
  });

  console.log(`Hotel created: ${hotel.name}`);

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminEmail = 'admin@grandroyal.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      hotelId: hotel.id,
    },
  });

  const waiterEmail = 'waiter@grandroyal.com';
  await prisma.user.upsert({
    where: { email: waiterEmail },
    update: {},
    create: {
      name: 'John Waiter',
      email: waiterEmail,
      password: hashedPassword,
      role: 'WAITER',
      hotelId: hotel.id,
    },
  });

  console.log('Users created: admin@grandroyal.com, waiter@grandroyal.com');

  // 3. Create Tables
  const tableNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const tables = await Promise.all(
    tableNumbers.map((num) =>
      prisma.table.create({
        data: {
          number: num,
          capacity: num === '10' ? 8 : 4,
          hotelId: hotel.id,
        },
      })
    )
  );

  console.log(`${tables.length} tables created.`);

  // 4. Create Menu Categories
  const categoriesData = [
    { name: 'Starters', multiplier: 1.0 },
    { name: 'Main Course', multiplier: 1.2 },
    { name: 'Beverages', multiplier: 0.8 },
    { name: 'Desserts', multiplier: 1.5 },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.menuCategory.create({
        data: {
          name: cat.name,
          pointsMultiplier: cat.multiplier,
          hotelId: hotel.id,
        },
      })
    )
  );

  console.log(`${categories.length} categories created.`);

  // 5. Create Menu Items
  const menuItemsData = [
    { name: 'Paneer Tikka', price: 250, category: 'Starters' },
    { name: 'Chicken Wings', price: 300, category: 'Starters' },
    { name: 'Veg Spring Rolls', price: 180, category: 'Starters' },
    { name: 'Butter Chicken', price: 450, category: 'Main Course' },
    { name: 'Paneer Butter Masala', price: 400, category: 'Main Course' },
    { name: 'Dal Makhani', price: 320, category: 'Main Course' },
    { name: 'Garlic Naan', price: 60, category: 'Main Course' },
    { name: 'Iced Tea', price: 120, category: 'Beverages' },
    { name: 'Fresh Lime Soda', price: 90, category: 'Beverages' },
    { name: 'Cappuccino', price: 150, category: 'Beverages' },
    { name: 'Gulab Jamun', price: 100, category: 'Desserts' },
    { name: 'Chocolate Lava Cake', price: 220, category: 'Desserts' },
  ];

  for (const item of menuItemsData) {
    const category = categories.find((c) => c.name === item.category);
    if (category) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          categoryId: category.id,
          hotelId: hotel.id,
          isAvailable: true,
        },
      });
    }
  }

  console.log('Menu items created.');

  // 6. Create Demo Customers
  const customer1 = await prisma.customer.create({
    data: {
      phone: '9876543210',
      name: 'Rahul Sharma',
      hotelId: hotel.id,
      pointsBalance: 50,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      phone: '9876543211',
      name: 'Priya Singh',
      hotelId: hotel.id,
      pointsBalance: 120,
    },
  });

  console.log('Demo customers created.');

  // 7. Create an Open Shift
  const openShift = await prisma.shift.create({
    data: {
      hotelId: hotel.id,
      status: 'OPEN',
      startTime: new Date(),
    },
  });

  console.log('Open shift created.');

  // 8. Create some past orders and transactions (Demo History)
  // We'll create 5 orders for yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const pastaItem = await prisma.menuItem.findFirst({ where: { name: 'Butter Chicken' } });
  const cokeItem = await prisma.menuItem.findFirst({ where: { name: 'Iced Tea' } });

  if (pastaItem && cokeItem) {
    for (let i = 0; i < 5; i++) {
        const order = await prisma.order.create({
            data: {
                hotelId: hotel.id,
                tableId: tables[i % tables.length].id,
                status: 'COMPLETED',
                totalAmount: pastaItem.price + cokeItem.price,
                createdAt: yesterday,
                items: {
                    create: [
                        { itemId: pastaItem.id, quantity: 1, price: pastaItem.price },
                        { itemId: cokeItem.id, quantity: 1, price: cokeItem.price },
                    ]
                }
            }
        });

        await prisma.transaction.create({
            data: {
                orderId: order.id,
                amount: order.totalAmount,
                status: 'PAID',
                paymentMethod: i % 2 === 0 ? 'CASH' : 'UPI',
                gstAmount: order.totalAmount * 0.05,
                hotelId: hotel.id,
                customerId: i === 0 ? customer1.id : null,
                createdAt: yesterday,
            }
        });
    }
  }

  console.log('History data (yesterday\'s orders) created.');

  console.log('--- Seeding Process Finished Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
