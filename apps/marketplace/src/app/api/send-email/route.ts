export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    console.log('===================================');
    console.log('MOCK EMAIL SENT');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('----------------- BODY -----------------');
    console.log(html);
    console.log('===================================');

    return Response.json({ message: 'Email sent successfully (simulated)' });
  } catch (err) {
    console.error('Email API Error:', err);
    const details = err instanceof Error ? err.message : 'An unknown error occurred';
    return Response.json({ error: 'Failed to send email.', details }, { status: 500 });
  }
}

export function GET() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
