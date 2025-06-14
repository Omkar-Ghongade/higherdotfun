'use client';
import { useWallet } from './useWallet';
import Logo from '../components/Logo'
import Image from 'next/image';
import HigherImg from '../public/higer.png'
import { useRouter } from 'next/navigation'; // For Next.js 13+ App Router
// import { useRouter } from 'next/router'; // For Next.js Pages Router
// import Link from 'next/link'; // Alternative approach using Link

export default function Header() {
  const { account, connect, disconnect } = useWallet();
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/'); // Navigate to home page
  };

  return (
    <header
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 2rem',
        backgroundColor: '#0e101c',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.13)',
      }}
    >
      {/* Absolutely positioned image */}
      <div
        onClick={handleLogoClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'pointer',
          width: 200,
          height: 200,
        }}
      >
        <Image
          width={200}
          height={200}
          priority
          src={HigherImg}
          alt="Follow us on Twitter"
        />
      </div>

      {/* Spacer div to prevent overlap with absolute image */}
      <div style={{ width: 200 }} />

      {/* Wallet connect/disconnect button */}
      <div>
        {account ? (
          <button
            onClick={disconnect}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              padding: '0.7rem 1.2rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                display: window.innerWidth >= 640 ? 'inline' : 'none',
              }}
            >
              {account.slice(0, 6)}...{account.slice(-4)} (Disconnect)
            </span>
            <span
              style={{
                display: window.innerWidth < 640 ? 'inline' : 'none',
              }}
            >
              {account.slice(0, 4)}...{account.slice(-3)}
            </span>
          </button>
        ) : (
          <button
            onClick={connect}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              padding: '0.7rem 1.2rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <span

            >
              Connect Wallet
            </span>

          </button>
        )}
      </div>
    </header>

  );
}