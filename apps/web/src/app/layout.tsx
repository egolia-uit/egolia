import 'plyr/dist/plyr.css';
import './global.css';

export const metadata = {
  title: 'Egolia',
  description: 'Elearning on the Go',
};

import { ToastProvider } from '#/components/ui/neumorphism/toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
