import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { passwordHash },
    create: { username: adminUsername, passwordHash },
  });
  console.log(`Admin user ready -> username: ${adminUsername}, password: ${adminPassword}`);

  const existingBooks = await prisma.book.count();
  if (existingBooks === 0) {
    const sample = [
      {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        summary:
          'Between life and death there is a library, and within that library, the shelves go on forever. A story about all the choices that go into a life well lived.',
        genre: 'Уран зохиол',
        coverImageUrl: 'https://placehold.co/400x600/1a3a3a/ffffff?text=The%20Midnight%20Library',
        startingPrice: 15000,
        increment: 3000,
        origin: 'foreign' as const,
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        summary: 'A sweeping history of humankind, from the emergence of Homo sapiens to the present day.',
        genre: 'Шинжлэх ухаан',
        coverImageUrl: 'https://placehold.co/400x600/5c1a1a/ffffff?text=Sapiens',
        startingPrice: 20000,
        increment: 4000,
        origin: 'foreign' as const,
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        summary: 'A stunning blend of adventure and mysticism set on the desert planet Arrakis.',
        genre: 'Уран зохиол',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
        startingPrice: 18000,
        increment: 3500,
        origin: 'foreign' as const,
      },
      {
        title: 'Educated',
        author: 'Tara Westover',
        summary: 'A memoir about a woman who leaves her survivalist family and goes on to earn a PhD from Cambridge.',
        genre: 'Бусад',
        coverImageUrl: 'https://placehold.co/400x600/3a2a52/ffffff?text=Educated',
        startingPrice: 16000,
        increment: 3000,
        origin: 'foreign' as const,
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        summary: 'Bilbo Baggins is swept into an epic quest to reclaim the lost Dwarf Kingdom of Erebor.',
        genre: 'Уран зохиол',
        coverImageUrl: 'https://placehold.co/400x600/2c1810/ffffff?text=The%20Hobbit',
        startingPrice: 22000,
        increment: 5000,
        origin: 'foreign' as const,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        summary: 'An easy and proven way to build good habits and break bad ones.',
        genre: 'Хувь хүний хөгжил',
        coverImageUrl: 'https://placehold.co/400x600/1a2744/ffffff?text=Atomic%20Habits',
        startingPrice: 14000,
        increment: 3000,
        origin: 'foreign' as const,
      },
      {
        title: 'Тунгалаг Тамир',
        author: 'Ч. Лодойдамба',
        summary: 'Монгол ардын амьдралыг харуулсан алдартай туужит роман.',
        genre: 'Уран зохиол',
        coverImageUrl: 'https://placehold.co/400x600/1a2744/ffffff?text=Тунгалаг+Тамир',
        startingPrice: 12000,
        increment: 2000,
        origin: 'mongolian' as const,
      },
    ];

    for (const book of sample) {
      await prisma.book.create({
        data: {
          ...book,
          currentPrice: book.startingPrice,
          status: 'live',
          auctionEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log(`Seeded ${sample.length} sample books.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
