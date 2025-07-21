import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, title, description, city, max_guests, bedrooms, bathrooms, latitude, longitude, base_price
       FROM property`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}