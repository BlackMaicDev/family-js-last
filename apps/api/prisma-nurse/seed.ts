import { PrismaClient } from '@prisma/client-nurse';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding default Shift Types...');

    const shiftTypes = [
        {
            name: 'เวรเช้า',
            code: 'M',
            startTime: '08:00',
            endTime: '16:00',
            durationHours: 8,
            color: '#f59e0b', // Amber/Orange
        },
        {
            name: 'เวรบ่าย',
            code: 'A',
            startTime: '16:00',
            endTime: '00:00',
            durationHours: 8,
            color: '#10b981', // Emerald/Green
        },
        {
            name: 'เวรดึก',
            code: 'N',
            startTime: '00:00',
            endTime: '08:00',
            durationHours: 8,
            color: '#6366f1', // Indigo/Blue
        },
        {
            name: 'เช้า/บ่าย',
            code: 'M/A',
            startTime: '08:00',
            endTime: '00:00',
            durationHours: 16,
            color: '#14b8a6', // Teal
        },
        {
            name: 'ดึก/บ่าย',
            code: 'N/A',
            startTime: '00:00',
            endTime: '00:00',
            durationHours: 16,
            color: '#0ea5e9', // Sky Blue
        },
    ];

    for (const shift of shiftTypes) {
        const existing = await prisma.shiftType.findFirst({
            where: { code: shift.code }
        });

        if (!existing) {
            await prisma.shiftType.create({
                data: shift
            });
            console.log(`✅ Created shift type: ${shift.name} (${shift.code})`);
        } else {
            console.log(`⏭️ Skipped (already exists): ${shift.name} (${shift.code})`);
        }
    }

    console.log('🎉 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
