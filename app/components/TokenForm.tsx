'use client';
import React, { useState } from 'react';
import { useWallet } from './useWallet';

export default function TokenForm() {
  const { account } = useWallet();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) {
      alert('Connect wallet first!');
      return;
    }
    alert(`Token Created!\nName: ${name}\nSymbol: ${symbol}\nSupply: ${supply}`);
    // TODO: Integrate Algorand token creation logic here
  }

  return (
    <section className="token-form">
      <h2>🚀 Create Your Token</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Token Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          placeholder="Symbol"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          required
        />
        <input
          placeholder="Total Supply"
          type="number"
          value={supply}
          onChange={e => setSupply(e.target.value)}
          required
        />
        <button type="submit" disabled={!account}>
          Create Token
        </button>
      </form>
    </section>
  );
}
