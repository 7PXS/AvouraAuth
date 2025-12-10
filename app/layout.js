export const metadata = {
  title: 'Yellow World',
  description: 'A simple Next.js app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
