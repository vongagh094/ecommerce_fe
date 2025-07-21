import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import Pusher from 'pusher';
import { parse } from 'querystring';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);

  if (pathname.endsWith('/auth')) {
    const text = await request.text();
    const body = parse(text);

    const { socket_id, channel_name, user_id } = body;

    if (!socket_id || !channel_name || !user_id) {
      return NextResponse.json({ error: 'Thiếu các trường bắt buộc' }, { status: 400 });
    }

    const { rows } = await pool.query('SELECT 1 FROM users WHERE id = $1', [user_id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 401 });
    }

    if (channel_name.toString().startsWith('private-conversation-')) {
      const conversationId = channel_name.toString().replace('private-conversation-', '');
      const { rows: authRows } = await pool.query(
        `SELECT 1 FROM conversation WHERE id = $1 AND (guest_id = $2 OR host_id = $2)`,
        [conversationId, user_id]
      );

      if (authRows.length === 0) {
        return NextResponse.json({ error: 'Không được phép' }, { status: 403 });
      }
    }

    const auth = pusher.authenticate(socket_id.toString(), channel_name.toString(), {
      user_id: user_id.toString(),
      user_info: { id: user_id },
    });

    return NextResponse.json(auth);
  }

  if (pathname.endsWith('/typing')) {
    const body = await request.json();
    const { conversationId, userId, isTyping } = body;

    if (!conversationId || !userId || isTyping === undefined) {
      return NextResponse.json({ error: 'Thiếu các trường bắt buộc' }, { status: 400 });
    }

    try {
      await pusher.trigger(`private-conversation-${conversationId}`, 'typing', { userId, isTyping });
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Lỗi khi trigger typing' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Đường dẫn không hợp lệ' }, { status: 400 });
}