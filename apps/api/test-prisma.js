const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: undefined },
      include: { 
        gradeLevel: true, 
        lessons: { orderBy: { order: 'asc' } }, 
        exams: { 
          include: { 
            examType: true, 
            _count: { select: { questions: true } } 
          } 
        } 
      }
    });
    console.log('Success:', subject);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
