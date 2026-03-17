'use client';

import dynamic from 'next/dynamic';

const CheckoutPage = dynamic(
  () => import('@/components/CheckoutPage'),
  { ssr: false }
);

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
