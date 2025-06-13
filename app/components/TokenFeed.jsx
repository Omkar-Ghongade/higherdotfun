'use client';
import React from 'react';

const mockTokens = [
  { name: 'ALGO PUMP', symbol: 'ALGOP', price: '0.23', volume: '120K' },
  { name: 'MEME COIN', symbol: 'MEME', price: '0.01', volume: '80K' },
  { name: 'DEGEN', symbol: 'DGN', price: '0.09', volume: '50K' },
];

export default function TokenFeed() {
  return (
    <section className="token-feed">
      <h2>🔥 Trending Tokens</h2>
      <div className="grid">
        {mockTokens.map((token) => (
          <div key={token.symbol} className="card">
            <div className="token-name">{token.name}</div>
            <div className="token-symbol">{token.symbol}</div>
            <div className="token-price">Price: <span>${token.price}</span></div>
            <div className="token-volume">Volume: <span>{token.volume}</span></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .token-feed {
          background: #1e2133;
          padding: 2rem;
          border-radius: 12px;
          color: white;
        }
        h2 {
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
          font-weight: 700;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }
        .card {
          background: #2a2d44;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.3);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgb(0 0 0 / 0.5);
        }
        .token-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: #facc15; /* bright yellow */
        }
        .token-symbol {
          font-size: 1rem;
          font-weight: 600;
          color: #a1a1aa; /* gray */
        }
        .token-price,
        .token-volume {
          font-size: 0.95rem;
          color: #e0e0e0;
        }
        .token-price span,
        .token-volume span {
          font-weight: 700;
          color: #4ade80; /* green */
        }
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
