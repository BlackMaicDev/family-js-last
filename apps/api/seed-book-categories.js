
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    // หมวดบันเทิงคดี (Fiction)
    { name: 'วรรณกรรม/นิยาย (Literature)', slug: 'literature' },
    { name: 'สืบสวนสอบสวน (Mystery/Thriller)', slug: 'mystery-thriller' },
    { name: 'แฟนตาซี/ไซไฟ (Fantasy/Sci-Fi)', slug: 'fantasy-scifi' },
    { name: 'นิยายรัก (Romance)', slug: 'romance' },
    { name: 'สยองขวัญ (Horror)', slug: 'horror' },
    { name: 'นิยายวาย/Y', slug: 'yaoi-y' },

    // หมวดสารคดีและความรู้ (Non-Fiction)
    { name: 'บริหาร/ธุรกิจ (Business/Management)', slug: 'business-management' },
    { name: 'จิตวิทยา/พัฒนาตนเอง (Self-Help/Psychology)', slug: 'self-help-psychology' },
    { name: 'ประวัติศาสตร์/การเมือง (History/Politics)', slug: 'history-politics' },
    { name: 'อาหารและเครื่องดื่ม (Cookbooks)', slug: 'cookbooks' },
    { name: 'สุขภาพ/ความงาม (Health/Wellness)', slug: 'health-wellness' },
    { name: 'ท่องเที่ยว (Travel)', slug: 'travel' },
    { name: 'เทคโนโลยี/คอมพิวเตอร์ (Technology)', slug: 'technology' },
  ];

  console.log('Start seeding book categories...');
  
  for (const cat of categories) {
    await prisma.bookCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
