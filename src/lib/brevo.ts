/**
 * Brevo (formerly Sendinblue) Email Service
 * Uses REST API v3 to send transactional emails.
 */

export type EmailSender = 'security' | 'noreply';

const SENDERS: Record<EmailSender, { name: string; email: string; replyTo: string }> = {
    security: {
        name: 'Chào Market Security',
        email: 'security@chaomarket.com',
        replyTo: 'support@chaomarket.com',
    },
    noreply: {
        name: 'Chào Market',
        email: 'noreply@chaomarket.com',
        replyTo: 'support@chaomarket.com',
    },
};

interface SendEmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
    sender?: EmailSender;
}

export async function sendEmail({
    to,
    subject,
    htmlContent,
    sender: senderType = 'security',
}: SendEmailOptions): Promise<{ messageId?: string }> {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error('BREVO_API_KEY is not configured in environment variables');
    }

    const { name: senderName, email: senderEmail, replyTo } = SENDERS[senderType];

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            replyTo: { email: replyTo },
            to: [{ email: to }],
            subject,
            htmlContent,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Brevo API error:', data);
        throw new Error(data.message || `Brevo API error: ${response.status}`);
    }

    return data;
}
