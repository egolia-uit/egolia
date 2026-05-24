import Script from 'next/script';
import 'plyr/dist/plyr.css';

import { ToastProvider } from '#/components/ui/neumorphism/toast';

import './global.css';

export const metadata = {
  title: 'Egolia',
  description: 'Elearning on the Go',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        <Script src="/runtime-env" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
