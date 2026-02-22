export const getFullUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/^["']|["']$/g, '').replace(/\/$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiUrl}${cleanUrl}`;
};

/**
 * บีบอัดรูปภาพก่อนอัพโหลด ใช้ Canvas API
 * - ย่อขนาดภาพ ถ้าด้านยาวเกิน maxSize (default 1920px)
 * - แปลงเป็น JPEG คุณภาพ quality (default 0.8)
 * 
 * @param file - ไฟล์รูปภาพต้นฉบับ
 * @param options - ตั้งค่า maxSize, quality, outputType
 * @returns File หรือ base64 string ขึ้นอยู่กับ outputType
 */
export async function compressImage(
    file: File,
    options?: {
        maxSize?: number;       // ขนาดพิกเซลด้านยาวสุด (default: 1920)
        quality?: number;       // คุณภาพ JPEG 0-1 (default: 0.8)
        outputType?: 'file' | 'base64';  // ประเภท output (default: 'file')
    }
): Promise<File | string> {
    const { maxSize = 1920, quality = 0.8, outputType = 'file' } = options || {};

    // ถ้าไม่ใช่รูปภาพ ให้ return กลับไปเลย
    if (!file.type.startsWith('image/')) {
        if (outputType === 'base64') {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
        }
        return file;
    }

    // ถ้าเป็น GIF หรือ SVG ไม่ต้อง compress
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        if (outputType === 'base64') {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
        }
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            // ย่อขนาดถ้าเกิน maxSize
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height / width) * maxSize);
                    width = maxSize;
                } else {
                    width = Math.round((width / height) * maxSize);
                    height = maxSize;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            if (outputType === 'base64') {
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            } else {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Image compression failed'));
                            return;
                        }
                        // ใช้ชื่อไฟล์เดิม เปลี่ยนนามสกุลเป็น .jpg
                        const fileName = file.name.replace(/\.[^.]+$/, '.jpg');
                        const compressedFile = new File([blob], fileName, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for compression'));
        };

        img.src = url;
    });
}
