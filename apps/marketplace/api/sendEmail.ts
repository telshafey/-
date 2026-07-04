// Vercel Edge Functions are type-compatible with the Web API Request and Response objects.
export const config = {
  runtime: 'edge',
};

// This is a mock email sending function.
// In a real production app, you would integrate a service like Resend, SendGrid, or Nodemailer.
// This function simulates sending an email by logging the details to the server console.
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- MOCK EMAIL SENDING ---
    // Instead of sending a real email, we log it to the console.
    // This allows you to see what would have been sent during development.
    console.log("===================================");
    console.log("📧 MOCK EMAIL SENT 📧");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("----------------- BODY -----------------");
    console.log(html);
    console.log("===================================");
    // --- END MOCK EMAIL SENDING ---
    
    // To integrate a real email service (e.g., Resend), your code would look like this:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
        from: 'Alrehla <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
    });
    */

    return new Response(JSON.stringify({ message: 'Email sent successfully (simulated)' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("Email API Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to send email.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}