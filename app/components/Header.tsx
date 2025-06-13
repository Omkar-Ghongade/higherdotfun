'use client';
import { useWallet } from './useWallet';
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
    <header className="header-simple">
      <div className="logo" onClick={handleLogoClick}>
        higher.fun
      </div>
      {/* Alternative using Link component:
      <Link href="/" className="logo-link">
        <div className="logo">higher.fun</div>
      </Link>
      */}
      <div>
        {account ? (
          <button className="wallet-btn" onClick={disconnect}>
            <span className="wallet-address-full">
              {account.slice(0, 6)}...{account.slice(-4)} (Disconnect)
            </span>
            <span className="wallet-address-short">
              {account.slice(0, 4)}...{account.slice(-3)}
            </span>
          </button>
        ) : (
          <button className="wallet-btn" onClick={connect}>
            <span className="connect-full">Connect Wallet</span>
            <span className="connect-short">Connect</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .header-simple {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          background: #0e101c;
          box-shadow: 0 2px 8px #0002;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .logo:hover {
          opacity: 0.8;
        }
        /* Alternative styles for Link approach:
        .logo-link {
          text-decoration: none;
        }
        .logo-link .logo {
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .logo-link .logo:hover {
          opacity: 0.8;
        }
        */
        .wallet-btn {
          background: #4f46e5;
          color: #fff;
          border: none;
          padding: 0.7rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
        }
        .wallet-btn:hover {
          background: #6366f1;
        }
        .wallet-address-short,
        .connect-short {
          display: none;
        }
        .wallet-address-full,
        .connect-full {
          display: inline;
        }

        /* Tablet styles */
        @media (max-width: 768px) {
          .header-simple {
            padding: 1.25rem 1.5rem;
          }
          .logo {
            font-size: 1.3rem;
          }
          .wallet-btn {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }

        /* Mobile styles */
        @media (max-width: 640px) {
          .header-simple {
            padding: 1rem 1rem;
          }
          .logo {
            font-size: 1.2rem;
          }
          .wallet-btn {
            padding: 0.5rem 0.8rem;
            font-size: 0.85rem;
          }
          .wallet-address-full,
          .connect-full {
            display: none;
          }
          .wallet-address-short,
          .connect-short {
            display: inline;
          }
        }

        /* Very small mobile */
        @media (max-width: 480px) {
          .header-simple {
            padding: 0.875rem 0.75rem;
          }
          .logo {
            font-size: 1.1rem;
          }
          .wallet-btn {
            padding: 0.5rem 0.6rem;
            font-size: 0.8rem;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .logo {
            font-size: 1rem;
          }
          .wallet-btn {
            padding: 0.4rem 0.5rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </header>
  );
}