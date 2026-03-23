import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return new NextResponse(page('❌',"Ungültiger Link."), { status:400, headers:{'Content-Type':'text/html'} });
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url||!key) return new NextResponse(page('❌','Serverfehler.'), { status:500, headers:{'Content-Type':'text/html'} });

  const res = await fetch(`${url}/rest/v1/waitlist_gbucht?confirm_token=eq.${token}&select=id,confirmed`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
  });
  const entries = await res.json();
  if (!entries.length) return new NextResponse(page('❌','Link ungültig oder abgelaufen.'), { status:404, headers:{'Content-Type':'text/html'} });
  if (entries[0].confirmed) return new NextResponse(page('✅','Du bist bereits bestätigt!'), { status:200, headers:{'Content-Type':'text/html'} });

  await fetch(`${url}/rest/v1/waitlist_gbucht?confirm_token=eq.${token}`, {
    method:'PATCH', headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`},
    body: JSON.stringify({confirmed:true, confirmed_at:new Date().toISOString()}),
  });
  return new NextResponse(page('✅',"Passt! Du bist als Founding Member vorgemerkt. Wir melden uns wenn's losgeht."), { status:200, headers:{'Content-Type':'text/html'} });
}

function page(emoji:string, msg:string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>g'bucht.</title></head>
<body style="font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="text-align:center;max-width:400px;padding:40px"><div style="font-size:3rem;margin-bottom:24px">${emoji}</div>
<h1 style="font-size:1.8rem;margin-bottom:8px;color:#4ade80">g'bucht.</h1><p style="color:#888">${msg}</p>
<p style="margin-top:32px"><a href="https://gbucht.at" style="color:#4ade80">← Zurück</a></p></div></body></html>`;
}
