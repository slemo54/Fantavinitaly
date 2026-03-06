import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { to, subject, html } = await request.json()

        const { data, error } = await resend.emails.send({
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
        })

        if (error) {
            return NextResponse.json({ error }, { status: 400 })
        }

        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
