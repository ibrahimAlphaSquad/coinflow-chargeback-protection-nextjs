import './globals.css';
import CoinflowProtection from '@/components/CoinflowProtection';
import Nav from '@/components/Nav';
// import NSureScript from '@/components/NSureScript';

export const metadata = {
  title: 'Coinflow Chargeback Protection',
  description: 'Chargeback protection for crypto purchases',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <NSureScript /> */}
        <CoinflowProtection />
        <Nav />
        {children}
      </body>
    </html>
  );
}
