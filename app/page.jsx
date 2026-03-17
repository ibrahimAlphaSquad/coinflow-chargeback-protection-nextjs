import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={styles.hero}>
      <h1>Welcome to My Store</h1>
      <p>
        CoinflowProtection is already active on this page (and every other page).
      </p>
      <Link href="/checkout" style={styles.ctaBtn}>
        Buy Now
      </Link>
    </div>
  );
}

const styles = {
  hero: {
    maxWidth: 600,
    margin: '80px auto',
    textAlign: 'center',
    padding: '0 24px',
  },
  ctaBtn: {
    display: 'inline-block',
    marginTop: 24,
    padding: '12px 32px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    textDecoration: 'none',
    cursor: 'pointer',
  },
};
