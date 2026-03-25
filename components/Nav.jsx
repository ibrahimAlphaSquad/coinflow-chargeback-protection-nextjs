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
      <div style={styles.links}>
        <Link href="/deposit" style={pathname === '/deposit' ? { ...styles.navBtn, ...styles.active } : styles.navBtn}>
          Deposit
        </Link>
        <Link href="/withdraw" style={pathname === '/withdraw' ? { ...styles.navBtn, ...styles.active } : styles.navBtn}>
          Withdraw
        </Link>
        <Link
          href={pathname === '/checkout' ? '/' : '/checkout'}
          style={pathname === '/checkout' ? { ...styles.navBtn, ...styles.active } : styles.navBtn}
        >
          {pathname === '/checkout' ? '← Home' : 'Checkout'}
        </Link>
      </div>
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
  links: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
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
  active: {
    background: '#f1f5f9',
    borderColor: '#94a3b8',
  },
};
