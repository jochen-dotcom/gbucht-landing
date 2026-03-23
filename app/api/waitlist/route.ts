import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Ungültige E-Mail.' }, { status: 400 });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!supabaseUrl || !supabaseKey || !resendKey) return NextResponse.json({ error: 'Server-Konfigurationsfehler.' }, { status: 500 });

    const checkRes = await fetch(`${supabaseUrl}/rest/v1/waitlist_gbucht?email=eq.${encodeURIComponent(email)}&select=id,confirmed,confirm_token`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
    });
    const existing = await checkRes.json();

    if (existing.length > 0) {
      if (existing[0].confirmed) return NextResponse.json({ success: true, message: 'Bereits angemeldet.' });
      await sendMail(email, existing[0].confirm_token, resendKey);
      return NextResponse.json({ success: true, message: 'Bestätigungsmail erneut gesendet.' });
    }

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/waitlist_gbucht`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'return=representation' },
      body: JSON.stringify({ email, confirmed: false }),
    });
    if (!insertRes.ok) return NextResponse.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });

    const inserted = await insertRes.json();
    await sendMail(email, inserted[0]?.confirm_token, resendKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}

async function sendMail(email: string, token: string, resendKey: string) {
  const confirmUrl = `https://gbucht.at/api/confirm?token=${token}`;
  const unsubUrl = `https://gbucht.at/api/unsubscribe?token=${token}`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: "g'bucht. <noreply@sup.date>",
      to: [email],
      subject: "Bestätige deine Vormerkung — g'bucht.",
      headers: { 'List-Unsubscribe': `<${unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      text: `Servas!\n\nDu hast dich für die g'bucht. Warteliste vorgemerkt — das erste Buchhaltungstool das wirklich für österreichische Einzelunternehmer gebaut wurde.\n\nBitte bestätige kurz deine Email:\n${confirmUrl}\n\nKein Spam, kein Newsletter — nur eine Nachricht wenn's losgeht.\n\nAbmelden: ${unsubUrl}\n\ng'bucht. — Rechnung raus. Geld rein. Passt.`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:40px 20px;">
<div style="max-width:480px;margin:0 auto;">
<h1 style="font-size:24px;font-weight:800;margin-bottom:4px;color:#4ade80;">g'bucht.</h1>
<p style="color:#666;font-size:13px;margin-bottom:32px;margin-top:0;">Rechnung raus. Geld rein. Passt.</p>

<p style="color:#d1d5db;line-height:1.7;font-size:15px;margin-bottom:16px;">Servas!</p>

<p style="color:#aaa;line-height:1.7;font-size:15px;margin-bottom:16px;">Du hast dich für die <strong style="color:#fff;">g'bucht.</strong> Warteliste vorgemerkt — das erste Buchhaltungstool das wirklich für österreichische Einzelunternehmer gebaut wurde.</p>

<p style="color:#aaa;line-height:1.7;font-size:15px;margin-bottom:28px;">Bestätige kurz deine Email-Adresse und du bist als <strong style="color:#4ade80;">Founding Member</strong> dabei — mit dem besten Preis, für immer.</p>

<a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;margin-bottom:32px;">✓ Ja, ich bin dabei</a>

<p style="color:#444;font-size:12px;line-height:1.6;margin-top:24px;">Oder: <a href="${confirmUrl}" style="color:#4ade80;">${confirmUrl}</a></p>

<hr style="border:none;border-top:1px solid #1a1a1a;margin:28px 0;">
<p style="color:#444;font-size:12px;margin:0;">
<a href="${unsubUrl}" style="color:#555;">Nicht interessiert? Kein Problem.</a><br/>
gbucht.at · © 2026 · Gebaut in Österreich 🇦🇹</p>
</div></body></html>`,
    }),
  });
}
