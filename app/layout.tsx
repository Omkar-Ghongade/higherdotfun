import './globals.css';

export const metadata = {
  title: 'higher.fun',
  description: 'Pump.fun style frontend with Pera Algo Wallet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
