import type { Metadata } from 'next';
import { Fira_Code } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira', weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'CYBERRANGE // RED_TEAM vs BLUE_TEAM — TACTICAL OPERATIONS',
  description: 'Advanced cybersecurity simulation and training platform. Execute real-world attack and defense scenarios in isolated operational environments.',
  keywords: ['cybersecurity', 'red team', 'blue team', 'penetration testing', 'security training', 'cyber range'],
  openGraph: {
    title: 'CYBERRANGE // TACTICAL_OPS',
    description: 'Where Your Codebase Stays Unbreakable.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${firaCode.variable} font-mono antialiased bg-black text-[#00ff41] crt-overlay`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
