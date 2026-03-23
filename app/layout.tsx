import type { Metadata } from 'next';
export const metadata: Metadata = { title: "g'bucht. — Buchhaltung für österreichische Einzelunternehmer", description: 'Rechnung raus. Geld rein. Passt. Das erste Buchhaltungstool gebaut für AT EPU.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de"><body style={{margin:0}}>{children}</body></html>;
}
