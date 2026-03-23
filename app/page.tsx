"use client";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({email})
      });
      const data = await res.json();
      if (data.success) { setStatus("success"); }
      else { setMsg(data.error||"Fehler"); setStatus("error"); }
    } catch { setMsg("Verbindungsfehler"); setStatus("error"); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <div style={{maxWidth:540,width:"100%",padding:"40px 24px",textAlign:"center"}}>
        <div style={{display:"inline-block",background:"rgba(34,197,94,0.12)",color:"#4ade80",fontSize:13,fontWeight:600,padding:"6px 16px",borderRadius:20,marginBottom:32,letterSpacing:0.5}}>🇦🇹 COMING SOON · Warteliste offen</div>

        <h1 style={{fontSize:"2.4rem",fontWeight:800,lineHeight:1.1,marginBottom:8,background:"linear-gradient(135deg,#fff,#4ade80)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          g'bucht.
        </h1>
        <p style={{fontSize:"1.3rem",color:"#9ca3af",marginBottom:24,marginTop:0,fontWeight:500}}>
          Rechnung raus. Geld rein. Passt.
        </p>

        <p style={{fontSize:"1rem",color:"#6b7280",lineHeight:1.6,marginBottom:36}}>
          Das erste Buchhaltungstool, das <span style={{color:"#4ade80",fontWeight:600}}>für österreichische Einzelunternehmer</span> gebaut wurde — nicht adaptiert.
        </p>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:36,textAlign:"left"}}>
          {[
            ["🧾","Rechnung in 30 Sekunden","AT-Pflichtangaben automatisch korrekt — einfach Kunde wählen, fertig"],
            ["📒","E/A-Rechnung als Standard","Einnahmen-Ausgaben wie's sein soll — kein deutsches Buchhaltungsmonster"],
            ["🤖","KI-Belegscan","Beleg fotografieren → automatisch kategorisiert und verbucht"],
            ["🇦🇹","Österreich-native","Kleinunternehmerregelung, USt, FinanzOnline — alles eingebaut, nix nachgerüstet"],
          ].map(([icon,title,desc],i) => (
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 18px",background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
              <span style={{fontSize:"1.3rem",flexShrink:0,marginTop:2}}>{icon}</span>
              <span style={{fontSize:14,color:"#d1d5db",lineHeight:1.4}}><strong>{title}</strong> — {desc}</span>
            </div>
          ))}
        </div>

        {status==="success" ? (
          <div style={{padding:16,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:10,color:"#4ade80",fontSize:14,marginBottom:12}}>
            ✅ Passt! Bestätigungsmail checken — ein Klick und du bist dabei.
          </div>
        ) : (
          <form onSubmit={submit}>
            {status==="error" && <div style={{padding:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,color:"#fca5a5",fontSize:13,marginBottom:12}}>{msg}</div>}
            <div style={{display:"flex",gap:10,marginBottom:8}}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.at" required
                style={{flex:1,padding:"14px 18px",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:15,outline:"none"}}/>
              <button type="submit" disabled={status==="loading"}
                style={{padding:"14px 24px",background:"#16a34a",color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                {status==="loading" ? "..." : "Platz sichern"}
              </button>
            </div>
          </form>
        )}
        <p style={{fontSize:12,color:"#6b7280",marginTop:8}}>Founding Members bekommen den besten Preis — für immer. Eine Mail wenn's losgeht.</p>

        <div style={{marginTop:32,padding:"16px 20px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.04)",textAlign:"left"}}>
          <p style={{fontSize:13,color:"#9ca3af",lineHeight:1.5,margin:0}}>
            Für alle, die lieber <strong style={{color:"#d1d5db"}}>arbeiten</strong> als <strong style={{color:"#d1d5db"}}>buchen</strong>.
          </p>
          <p style={{fontSize:12,color:"#6b7280",marginTop:6,margin:"6px 0 0"}}>
            Gebaut in Österreich. Für Österreich. Keine Kompromisse.
          </p>
        </div>

        <footer style={{marginTop:32,fontSize:12,color:"#4b5563"}}>gbucht.at · © 2026</footer>
      </div>
    </div>
  );
}
