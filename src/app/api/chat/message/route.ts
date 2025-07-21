import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { pusherServer } from "@/lib/pusher"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!conversationId || !userId) {
      return NextResponse.json({ error: "conversationId and userId are required" }, { status: 400 })
    }

    // Lấy danh sách tin nhắn
    const query = `
      SELECT 
        m.*,
        u.id as sender_id,
        u.username as sender_username,
        u.full_name as sender_full_name
      FROM message m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.sent_at DESC
      LIMIT $2 OFFSET $3
    `
    
    const result = await pool.query(query, [conversationId, limit, offset])
    const messages = result.rows.map(row => ({
      id: row.id,
      conversation_id: row.conversation_id,
      sender_id: row.sender_id,
      message_text: row.message_text,
      sent_at: row.sent_at,
      is_read: row.is_read,
      sender: {
        id: row.sender_id,
        username: row.sender_username,
        full_name: row.sender_full_name
      }
    }))

    // Cập nhật trạng thái đã đọc cho tin nhắn của người khác
    const updateResult = await pool.query(
      "UPDATE message SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE RETURNING *",
      [conversationId, userId]
    )

    // Nếu có tin nhắn được cập nhật trạng thái is_read, gửi sự kiện messages-read qua Pusher
    if (updateResult.rows.length > 0) {
      const updatedMessages = updateResult.rows.map(row => ({
        id: row.id,
        conversation_id: row.conversation_id,
        sender_id: row.sender_id,
        message_text: row.message_text,
        sent_at: row.sent_at,
        is_read: row.is_read,
        sender: {
          id: row.sender_id,
          username: row.sender_username || "",
          full_name: row.sender_full_name || ""
        }
      }))

      await pusherServer.trigger(`conversation-${conversationId}`, "messages-read", updatedMessages)
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { conversationId, userId, message_text, markAsRead } = await request.json()

    // Handle mark as read request
    if (markAsRead) {
      if (!conversationId || !userId) {
        return NextResponse.json({ error: "conversationId and userId are required" }, { status: 400 })
      }

      // Verify user is part of the conversation
      const convQuery = `
        SELECT * FROM conversation 
        WHERE id = $1 AND (guest_id = $2 OR host_id = $2)
      `
      const convResult = await pool.query(convQuery, [conversationId, userId])
      if (convResult.rows.length === 0) {
        return NextResponse.json({ error: "User not part of conversation" }, { status: 403 })
      }

      // Update read status for messages
      const updateResult = await pool.query(
        "UPDATE message SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE RETURNING *",
        [conversationId, userId]
      )

      // If messages were updated, trigger Pusher event
      if (updateResult.rows.length > 0) {
        const updatedMessages = updateResult.rows.map(row => ({
          id: row.id,
          conversation_id: row.conversation_id,
          sender_id: row.sender_id,
          message_text: row.message_text,
          sent_at: row.sent_at,
          is_read: row.is_read,
          sender: {
            id: row.sender_id,
            username: row.sender_username || "",
            full_name: row.sender_full_name || ""
          }
        }))

        await pusherServer.trigger(`conversation-${conversationId}`, "messages-read", updatedMessages)
      }

      return NextResponse.json({ success: true, updatedMessages: updateResult.rows })
    }

    // Handle new message creation
    if (!conversationId || !userId || !message_text) {
      return NextResponse.json({ error: "conversationId, userId, and message_text are required" }, { status: 400 })
    }

    // Kiểm tra xem người dùng có thuộc cuộc trò chuyện không
    const convQuery = `
      SELECT * FROM conversation 
      WHERE id = $1 AND (guest_id = $2 OR host_id = $2)
    `
    const convResult = await pool.query(convQuery, [conversationId, userId])
    if (convResult.rows.length === 0) {
      return NextResponse.json({ error: "User not part of conversation" }, { status: 403 })
    }

    // Tạo tin nhắn mới
    const messageQuery = `
      INSERT INTO message (conversation_id, sender_id, message_text, sent_at, is_read)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, FALSE)
      RETURNING *
    `
    const messageResult = await pool.query(messageQuery, [conversationId, userId, message_text])
    const newMessage = messageResult.rows[0]

    // Cập nhật thời gian tin nhắn cuối cùng của cuộc trò chuyện
    await pool.query(
      "UPDATE conversation SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1",
      [conversationId]
    )

    // Lấy thông tin người gửi
    const userQuery = "SELECT id, username, full_name FROM users WHERE id = $1"
    const userResult = await pool.query(userQuery, [userId])
    const sender = userResult.rows[0]

    // Chuẩn bị dữ liệu tin nhắn để gửi qua Pusher
    const messageToSend = {
      id: newMessage.id,
      conversation_id: newMessage.conversation_id,
      sender_id: newMessage.sender_id,
      message_text: newMessage.message_text,
      sent_at: newMessage.sent_at,
      is_read: newMessage.is_read,
      sender: {
        id: sender.id,
        username: sender.username || "",
        full_name: sender.full_name || ""
      }
    }

    // Gửi sự kiện new-message qua Pusher
    await pusherServer.trigger(`conversation-${conversationId}`, "new-message", messageToSend)

    return NextResponse.json(messageToSend)
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}