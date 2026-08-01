import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vitafoam Admin Control Center',
  description: 'Enterprise Mobile Commerce Backend Administration Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
