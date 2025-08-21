import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const { accessToken, user } = await request.json()
		if (!accessToken || !user) {
			return NextResponse.json({ message: 'accessToken and user required' }, { status: 400 })
		}
		// Determine if we should set the secure flag
		const forwardedProto = request.headers.get('x-forwarded-proto')
		const isSecure = forwardedProto ? forwardedProto === 'https' : process.env.NODE_ENV === 'production'
		const res = NextResponse.json({ ok: true })
		// HttpOnly token cookie for backend auth
		res.cookies.set('auth_token', accessToken, {
			httpOnly: true,
			secure: isSecure,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		})
		// Readable user cookie to maintain UI state across reloads
		res.cookies.set('auth_user', Buffer.from(JSON.stringify({ id: user.id, name: user.name, email: user.email, avatar: user.avatar || '' }), 'utf8').toString('base64'), {
			httpOnly: false,
			secure: isSecure,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		})
		return res
	} catch (e) {
		return NextResponse.json({ message: 'Invalid body' }, { status: 400 })
	}
}

export async function DELETE(request: Request) {
	const forwardedProto = request.headers.get('x-forwarded-proto')
	const isSecure = forwardedProto ? forwardedProto === 'https' : process.env.NODE_ENV === 'production'
	const res = NextResponse.json({ ok: true })
	res.cookies.set('auth_token', '', { httpOnly: true, secure: isSecure, path: '/', maxAge: 0, sameSite: 'lax' })
	res.cookies.set('auth_user', '', { httpOnly: false, secure: isSecure, path: '/', maxAge: 0, sameSite: 'lax' })
	return res
} 