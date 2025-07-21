import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '@/lib/vapid';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const isReadRequest = url.searchParams.get('read') === 'true';
  const notificationId = url.searchParams.get('notification_id');

  if (isReadRequest && notificationId) {
    try {
      const { rows } = await pool.query(
        `UPDATE notification SET is_read = TRUE WHERE id = $1 RETURNING *`,
        [parseInt(notificationId)]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      const notification = rows[0];
      return NextResponse.json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  const { title, message, data, userId, type, is_pushed } = await request.json();

  // Validate required fields
  if (!title || !message || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Handle push notification if is_pushed is true
  if (is_pushed) {
    try {
      const { rows: subscriptions } = await pool.query(
        'SELECT endpoint, p256dh, auth FROM subscription WHERE user_id = $1',
        [userId]
      );

      for (const sub of subscriptions) {
        try {
          const payload = JSON.stringify({ 
            title, 
            body: message, 
            data, 
            timestamp: new Date().toISOString() 
          });
          webpush.setVapidDetails(
            'mailto:nnatu22@clc.fitus.edu.vn', 
            VAPID_PUBLIC_KEY, 
            VAPID_PRIVATE_KEY
          );
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
        } catch (error) {
          console.error('Push send error:', error);
          // Optionally remove invalid subscriptions
        }
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Continue even if push fails, as we still want to save the notification
    }
  }

  try {
    // Only insert required fields and fields without defaults that we want to set
    const { rows } = await pool.query(
      `INSERT INTO notification (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId, 
        type || null,  // type is optional
        title, 
        message, 
        data ? JSON.stringify(data) : null
      ]
    );

    const notification = rows[0];
    return NextResponse.json({ message: 'Notification processed', notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows: notifications } = await pool.query('SELECT * FROM notification');
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const { rowCount } = await pool.query(
      'DELETE FROM notification WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}