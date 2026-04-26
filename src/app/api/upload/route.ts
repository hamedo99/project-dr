import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Dynamic path resolution
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        // Unique filename
        const fileExtension = path.extname(file.name);
        const fileName = `${Date.now()}-${crypto.randomUUID()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, buffer);

        // Return the relative path for database storage
        const relativePath = `/uploads/${fileName}`;

        return NextResponse.json({ path: relativePath });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
