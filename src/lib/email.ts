import { Resend } from 'resend'
import { sponsorEmail, judgmentEmail } from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendJudgmentRequiredEmail(
    to: string[],
    proposerName: string,
    targetName: string,
    reason: string,
    transactionId: string
) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const link = `${appUrl}/giudica/${transactionId}`
    const template = judgmentEmail(proposerName, targetName, reason, link)

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Salvadanaio <noreply@w2d.it>',
            to: to,
            subject: template.subject,
            html: template.html,
        })
    } catch (error) {
        console.error('Failed to send judgment email:', error)
    }
}

export async function sendSponsorMilestoneEmail(
    to: string,
    userName: string,
    count: number,
    level: number
) {
    const template = sponsorEmail(userName, count, level)

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Salvadanaio <noreply@w2d.it>',
            to: [to],
            subject: template.subject,
            html: template.html,
        })
    } catch (error) {
        console.error('Failed to send sponsor milestone email:', error)
    }
}
