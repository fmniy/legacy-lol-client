import './globals.css';

export const metadata = {
  title: 'Legacy Client - Profile Viewer',
  description: 'An emulation of the legacy League of Legends client',
  icons: {
    icon: '/images/lol_icon.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
