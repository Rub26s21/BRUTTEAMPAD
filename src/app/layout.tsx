import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'BRUTSTeamPad — Real-Time Collaborative Editor',
    description:
        'Collaborative real-time document editor for students, small teams, and developers. Edit together with live cursors, autosave, and organized workspaces.',
    keywords: [
        'collaborative editor',
        'real-time editing',
        'team collaboration',
        'document editor',
        'CRDT',
    ],
    openGraph: {
        title: 'BRUTSTeamPad',
        description: 'Real-time collaborative document editor',
        type: 'website',
        siteName: 'BRUTSTeamPad',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-surface min-h-screen overflow-hidden bg-mesh">
                {/* Background ambient glow effects */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-600/[0.07] blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-neon-purple/[0.05] blur-[100px]" />
                    <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-neon-cyan/[0.04] blur-[80px]" />
                </div>

                {/* Main content */}
                <div className="relative z-10">{children}</div>
            </body>
        </html>
    );
}
