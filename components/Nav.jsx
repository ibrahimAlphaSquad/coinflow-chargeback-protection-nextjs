'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav style={styles.nav}>
      <Link href="/" style={styles.brand}>
        My Store
      </Link>
      <Link
        href={pathname === '/checkout' ? '/' : '/checkout'}
        style={styles.navBtn}
      >
        {pathname === '/checkout' ? '← Back to Home' : 'Go to Checkout →'}
      </Link>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 32px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fff',
  },
  brand: {
    fontWeight: 700,
    fontSize: 18,
    textDecoration: 'none',
    color: 'inherit',
  },
  navBtn: {
    padding: '8px 18px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    cursor: 'pointer',
    background: 'transparent',
    fontSize: 14,
    textDecoration: 'none',
    color: 'inherit',
  },
};
