'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CreatedToken {
    id: string;
    creator_address: string;
    asset_id: string; // stored as string in Supabase
    asset_name: string;
    unit_name: string;
    metadata_url?: string;
    created_at: string;
}

export default function AllTokens() {
    const [tokens, setTokens] = useState<CreatedToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTokens = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('created_tokens')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            setTokens(data as CreatedToken[]);
            setLoading(false);
        };

        fetchTokens();
    }, []);

    return (
        <main className="all-tokens-container">
            <div className="header-section">
                <h1>All Created Tokens</h1>
                <p>Browse all Algorand Standard Assets created by users of this app.</p>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading tokens...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <p className="error">{error}</p>
                </div>
            ) : tokens.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🪙</div>
                    <h3>No Tokens Found</h3>
                    <p>No tokens have been created yet.</p>
                </div>
            ) : (
                <div className="tokens-grid">
                    {tokens.map(token => (
                        <div key={token.id} className="token-card">
                            <div className="token-header">
                                <h3>{token.asset_name || `Asset #${token.asset_id}`}</h3>
                                <span className="token-symbol">({token.unit_name})</span>
                            </div>
                            {token.metadata_url && (
                                <div className="token-media-container">
                                    {token.metadata_url.endsWith('.mp4') ? (
                                        <video controls src={token.metadata_url} className="token-media" />
                                    ) : (
                                        <img src={token.metadata_url} alt={token.asset_name || 'Token Image'} className="token-media" />
                                    )}
                                </div>
                            )}
                            <div className="token-info">
                                <div className="info-row">
                                    <span className="info-label">Asset ID:</span>
                                    <span className="info-value">{token.asset_id}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Creator:</span>
                                    <span className="info-value">{token.creator_address.slice(0, 6)}...{token.creator_address.slice(-4)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Created:</span>
                                    <span className="info-value">{new Date(token.created_at).toLocaleString()}</span>
                                </div>
                                {token.metadata_url && (
                                    <div className="info-row">
                                        <span className="info-label">Metadata:</span>
                                        <a href={token.metadata_url} target="_blank" rel="noopener noreferrer" className="info-value">
                                            View
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style jsx>{`
        .tokens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        .token-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px #0001;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .token-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .token-symbol {
          color: #888;
          font-size: 1rem;
        }
        .token-media-container {
          width: 100%;
          margin-bottom: 1rem;
          text-align: center;
        }
        .token-media {
          max-width: 100%;
          max-height: 120px;
          border-radius: 8px;
          object-fit: contain;
        }
        .token-info {
          width: 100%;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .info-label {
          color: #555;
          font-weight: 500;
        }
        .info-value {
          color: #222;
        }
      `}</style>
        </main>
    );
}
