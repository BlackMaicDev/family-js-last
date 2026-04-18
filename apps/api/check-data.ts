import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  console.log('Categories:', JSON.stringify(categories, null, 2));

  const samplePosts = await prisma.post.findMany({
    take: 5,
    include: { category: true }
  });

  console.log('Sample Posts:', JSON.stringify(samplePosts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
