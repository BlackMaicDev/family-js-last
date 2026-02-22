import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardData() {
        // ดึงจำนวน โพสต์ ผู้ใช้ และรูปภาพ ทั้งหมด
        const [totalPosts, activeUsers, totalPhotos] = await Promise.all([
            this.prisma.post.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.photo.count()
        ]);

        // ดึงโพสต์ล่าสุด 5 อัน
        const recentPosts = await this.prisma.post.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                status: true,
            }
        });

        // จัดรูปแบบโพสต์ให้ตรงกับที่ Frontend ใช้
        const formattedRecentPosts = recentPosts.map((post) => {
            const now = new Date().getTime();
            const created = new Date(post.createdAt).getTime();
            const diffInMinutes = Math.floor((now - created) / 60000);
            let timeString = '';

            if (diffInMinutes < 60) {
                timeString = diffInMinutes <= 0 ? 'เมื่อกี้' : `${diffInMinutes} นาทีที่แล้ว`;
            } else if (diffInMinutes < 1440) {
                timeString = `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
            } else if (diffInMinutes < 2880) {
                timeString = 'เมื่อวาน';
            } else {
                timeString = `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
            }

            return {
                id: post.id,
                title: post.title,
                date: timeString,
                status: post.status.toLowerCase(),
                views: 0,
            };
        });

        return {
            stats: {
                totalViews: 0,
                totalPosts,
                activeUsers,
                galleryItems: totalPhotos,
            },
            recentPosts: formattedRecentPosts,
            chartData: [
                { day: 'Mon', value: Math.floor(Math.random() * 100) + 30 },
                { day: 'Tue', value: Math.floor(Math.random() * 100) + 30 },
                { day: 'Wed', value: Math.floor(Math.random() * 100) + 30 },
                { day: 'Thu', value: Math.floor(Math.random() * 100) + 30 },
                { day: 'Fri', value: Math.floor(Math.random() * 100) + 30 },
                { day: 'Sat', value: Math.floor(Math.random() * 100) + 30 },
                { day: 'Sun', value: Math.floor(Math.random() * 100) + 30 },
            ],
        };
    }
}
