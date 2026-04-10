import { PrismaClient, FundType, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'User';
  const password = 'Password';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (!existingUser) {
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });

    console.log(`✅ Default user created successfully!`);
  } else {
    console.log(`Default user "${username}" already exists.`);
  }

  // Seed Categories
  const categories = [
    { name: '751 (Per Diem)', color: 'bg-blue-500' },
    { name: '753', color: 'bg-emerald-500' },
    { name: '755 (Supplies)', color: 'bg-amber-500' },
    { name: '761 (Gas/Oil/Lubricants)', color: 'bg-red-500' },
    { name: '765 (Other Supplies)', color: 'bg-purple-500' },
    { name: '773 (Celcards/Mobile)', color: 'bg-pink-500' },
    { name: '774 (Internet)', color: 'bg-indigo-500' },
    { name: 'Cable', color: 'bg-cyan-500' },
    { name: 'Office Equipment', color: 'bg-teal-500' },
    { name: 'IT Equipment and Software', color: 'bg-orange-500' },
    { name: '783 (Training)', color: 'bg-rose-500' },
    { name: '768 (News)', color: 'bg-fuchsia-500' },
    { name: '791', color: 'bg-slate-500' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { color: cat.color },
      create: { name: cat.name, color: cat.color },
    });
  }

  const cat1 = await prisma.category.findUnique({ where: { name: '751 (Per Diem)' } });
  const cat2 = await prisma.category.findUnique({ where: { name: '755 (Supplies)' } });
  const cat3 = await prisma.category.findUnique({ where: { name: 'IT Equipment and Software' } });

  // Seed Budgets
  const currentYear = new Date().getFullYear();

  // Create a default Budget Profile
  let defaultProfile = await prisma.budgetProfile.findUnique({
    where: { name: 'Default Profile' }
  });

  if (!defaultProfile) {
    defaultProfile = await prisma.budgetProfile.create({
      data: {
        name: 'Default Profile',
        description: 'Automatically created default budget profile'
      }
    });
    console.log(`✅ Default Budget Profile created successfully!`);
  }
  
  await prisma.budget.upsert({
    where: {
      profileId_fundType_year: {
        profileId: defaultProfile.id,
        fundType: FundType.REGULAR,
        year: currentYear,
      }
    },
    update: {},
    create: {
      profileId: defaultProfile.id,
      fundType: FundType.REGULAR,
      year: currentYear,
      totalAmount: 15000000.00,
    }
  });

  await prisma.budget.upsert({
    where: {
      profileId_fundType_year: {
        profileId: defaultProfile.id,
        fundType: FundType.COBF,
        year: currentYear,
      }
    },
    update: {},
    create: {
      profileId: defaultProfile.id,
      fundType: FundType.COBF,
      year: currentYear,
      totalAmount: 5000000.00,
    }
  });

  // Seed Some Transactions if none exist
  const existingTransactions = await prisma.transaction.count();
  if (existingTransactions === 0) {
    console.log('Seeding initial transactions...');
    await prisma.transaction.createMany({
      data: [
        {
          profileId: defaultProfile.id,
          amount: 1250000.00,
          description: 'Payroll - January',
          type: TransactionType.EXPENSE,
          fundType: FundType.REGULAR,
          categoryId: cat1?.id,
          date: new Date(currentYear, 0, 15),
        },
        {
          profileId: defaultProfile.id,
          amount: 350000.00,
          description: 'Office Supplies',
          type: TransactionType.EXPENSE,
          fundType: FundType.REGULAR,
          categoryId: cat2?.id,
          date: new Date(currentYear, 0, 20),
        },
        {
          profileId: defaultProfile.id,
          amount: 2500000.00,
          description: 'New Laptops',
          type: TransactionType.EXPENSE,
          fundType: FundType.REGULAR,
          categoryId: cat3?.id,
          date: new Date(currentYear, 1, 10),
        },
        // COBF Transactions
        {
          profileId: defaultProfile.id,
          amount: 500000.00,
          description: 'Field Work',
          type: TransactionType.EXPENSE,
          fundType: FundType.COBF,
          categoryId: cat1?.id,
          date: new Date(currentYear, 0, 25),
        },
        {
          profileId: defaultProfile.id,
          amount: 1500000.00,
          description: 'Server Upgrades',
          type: TransactionType.EXPENSE,
          fundType: FundType.COBF,
          categoryId: cat3?.id,
          date: new Date(currentYear, 1, 5),
        }
      ]
    });
    console.log('✅ Initial transactions seeded successfully!');
  } else {
    console.log(`Found ${existingTransactions} existing transactions. Skipping transaction seeding.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
