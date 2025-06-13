'use client';
import { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

// JAESRIMMAK7PHQVGFLQ5PN7BWHAEC7IYSZNR2FCSMNPR6KNRXO2NAI5TK4
// OD6PSORV2HI6YBP44XJ7B73Q5RPQ5OFWJZP72WDB562ASOXSGFYQZKLZWI
const peraWallet = new PeraWalletConnect();

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);

  async function connect() {
    try {
      const accounts = await peraWallet.connect();
      peraWallet.connector?.on('disconnect', disconnect);
      setAccount(accounts[0]);
    } catch (err: any) {
      if (err?.data?.type !== 'CONNECT_MODAL_CLOSED') {
        alert('Failed to connect wallet');
      }
    }
  }

  function disconnect() {
    peraWallet.disconnect();
    setAccount(null);
  }

  useEffect(() => {
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setAccount(accounts[0]);
        peraWallet.connector?.on('disconnect', disconnect);
      }
    });
  }, []);

  return { account, connect, disconnect, peraWallet };
}
