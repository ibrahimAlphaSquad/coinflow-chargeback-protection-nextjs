import dynamic from 'next/dynamic';

const DepositPage = dynamic(() => import('@/components/DepositPage'), { ssr: false });

export default function DepositRoute() {
  return <DepositPage />;
}
