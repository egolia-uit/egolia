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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
