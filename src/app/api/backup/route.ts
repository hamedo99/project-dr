import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

        // Check if database exists
        try {
            await fs.access(dbPath);
        } catch {
            return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
        }

        const fileBuffer = await fs.readFile(dbPath);

        // Create response with appropriate headers for download
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/x-sqlite3',
                'Content-Disposition': `attachment; filename="clinic_backup_${new Date().toISOString().split('T')[0]}.db"`,
            },
        });
    } catch (error) {
        console.error('Backup Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
