import * as fs from 'fs';
import * as path from 'path';

export function deleteFileFromUrl(fileUrl: string | null | undefined) {
    if (!fileUrl) return;

    try {
        // e.g., http://localhost:3001/public/uploads/123.jpg or /public/uploads/123.jpg
        const uploadDir = '/public/uploads/';
        const index = fileUrl.indexOf(uploadDir);

        if (index !== -1) {
            const filename = fileUrl.substring(index + uploadDir.length);
            const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error(`Failed to delete file for url: ${fileUrl}`, err);
    }
}
