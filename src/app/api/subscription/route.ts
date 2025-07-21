import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '@/lib/vapid';

export async function POST(request: Request) {
  const { endpoint, keys, userId } = await request.json();

  try {
    await pool.query(
      `INSERT INTO subscription (endpoint, p256dh, auth, user_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO NOTHING`,
      [endpoint, keys.p256dh, keys.auth, userId]
    );

    const payload = JSON.stringify({
      title: 'Welcome!',
      body: 'You have subscribed to notifications.',
      timestamp: new Date().toISOString(),
    });

    console.log('Sending push notification to:', endpoint);

    webpush.setVapidDetails('mailto:nnatu22@clc.fitus.edu.vn', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    await webpush
      .sendNotification(
        { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
        payload
      )
      .catch((err) => console.error('Push send error:', err));

    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}