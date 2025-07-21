import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Cần cung cấp userId" }, { status: 400 })
    }

    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ error: "userId phải là một số nguyên" }, { status: 400 })
    }

    const query = `
      SELECT 
        c.*,
        p.title as property_title,
        CASE 
          WHEN c.guest_id = $1 THEN h.full_name
          WHEN c.host_id = $1 THEN g.full_name
        END as other_user_full_name,
        CASE 
          WHEN c.guest_id = $1 THEN h.id
          WHEN c.host_id = $1 THEN g.id
        END as other_user_id,
        CASE 
          WHEN c.guest_id = $1 THEN h.username
          WHEN c.host_id = $1 THEN g.username
        END as other_user_username
      FROM conversation c
      LEFT JOIN property p ON c.property_id = p.id
      LEFT JOIN users g ON c.guest_id = g.id
      LEFT JOIN users h ON c.host_id = h.id
      WHERE c.guest_id = $1 OR c.host_id = $1
      ORDER BY c.last_message_at DESC NULLS LAST
    `
    
    const result = await pool.query(query, [userId])
    const conversations = result.rows.map(row => ({
      id: row.id,
      property_id: row.property_id,
      guest_id: row.guest_id,
      host_id: row.host_id,
      last_message_at: row.last_message_at,
      is_archived: row.is_archived,
      property_title: row.property_title,
      other_user: {
        id: row.other_user_id,
        username: row.other_user_username,
        full_name: row.other_user_full_name
      }
    }))

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Lỗi khi lấy danh sách conversation:", error)
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ khi lấy conversation" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { host_id, guest_id, property_id } = await request.json()

    if (!host_id || !guest_id) {
      return NextResponse.json({ error: "Cần cung cấp host_id và guest_id" }, { status: 400 })
    }

    if (isNaN(parseInt(host_id)) || isNaN(parseInt(guest_id))) {
      return NextResponse.json({ error: "host_id và guest_id phải là số nguyên" }, { status: 400 })
    }

    const userCheckQuery = "SELECT id FROM users WHERE id IN ($1, $2)"
    const userCheckResult = await pool.query(userCheckQuery, [host_id, guest_id])
    if (userCheckResult.rows.length !== 2) {
      return NextResponse.json({ error: "host_id hoặc guest_id không tồn tại" }, { status: 400 })
    }

    if (property_id !== null && property_id !== undefined) {
      if (isNaN(parseInt(property_id))) {
        return NextResponse.json({ error: "property_id phải là số nguyên" }, { status: 400 })
      }
      const propertyCheckQuery = "SELECT id FROM property WHERE id = $1"
      const propertyCheckResult = await pool.query(propertyCheckQuery, [property_id])
      if (propertyCheckResult.rows.length === 0) {
        return NextResponse.json({ error: "property_id không tồn tại" }, { status: 400 })
      }
    }

    const checkQuery = `
      SELECT id FROM conversation 
      WHERE host_id = $1 AND guest_id = $2 AND property_id IS NOT DISTINCT FROM $3
    `
    const checkResult = await pool.query(checkQuery, [host_id, guest_id, property_id])

    if (checkResult.rows.length > 0) {
      console.log("Conversation đã tồn tại, ID:", checkResult.rows[0].id)
      return NextResponse.json({ conversationId: checkResult.rows[0].id })
    }

    const insertQuery = `
      INSERT INTO conversation (host_id, guest_id, property_id, created_at, is_archived)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, FALSE)
      RETURNING id
    `
    const insertResult = await pool.query(insertQuery, [host_id, guest_id, property_id])
    const newConversationId = insertResult.rows[0].id
    console.log("Tạo conversation mới thành công, ID:", newConversationId)

    return NextResponse.json({ conversationId: newConversationId })
  } catch (error: any) {
    const { host_id, guest_id, property_id } = await request.json()
    console.error("Lỗi khi kiểm tra/tạo conversation:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack,
      input: { host_id, guest_id, property_id }
    })
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Lỗi: Không thể tạo conversation mới do trùng khóa chính. Vui lòng thử lại." },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: `Lỗi máy chủ nội bộ: ${error.message}` }, { status: 500 })
  }
}