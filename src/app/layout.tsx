/* ============================================
   BRUTSTeamPad — Root Layout
   App shell with auth state listener
   ============================================ */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthListener } from '@/components/auth/AuthListener';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'BRUTSTeamPad — Collaborative Editor',
    description:
        'Real-time collaborative document editor with team authentication, CRDT sync, and glassmorphism design.',
    keywords: ['collaboration', 'editor', 'real-time', 'team', 'documents'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-dark-950 text-white antialiased min-h-screen">
                <AuthListener />
                {children}
            </body>
        </html>
    );
}
