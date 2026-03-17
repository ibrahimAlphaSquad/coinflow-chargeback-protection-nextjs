import './globals.css';
import CoinflowProtection from '@/components/CoinflowProtection';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'Coinflow Chargeback Protection',
  description: 'Chargeback protection for crypto purchases',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CoinflowProtection />
        <Nav />
        {children}
      </body>
    </html>
  );
}
