import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Feel Home — Financial Simulator',
  description: 'Interactive financial model for the Feel Home ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
