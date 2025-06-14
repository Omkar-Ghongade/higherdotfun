'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

interface CreatedToken {
    id: string;
    creator_address: string;
    assetId: string;
    asset_name: string;
    unit_name: string;
    metadata_url?: string;
    created_at: string;
}

export default function TokenDetails({ params }: { params: { id: string } }) {
    const [token, setToken] = useState<CreatedToken | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchToken = async () => {
            if (!params.id) {
                setError('Token ID is missing');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('created_tokens')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) {
                    setError(error.message);
                    setLoading(false);
                    return;
                }

                if (!data) {
                    setError('Token not found');
                    setLoading(false);
                    return;
                }

                setToken(data as CreatedToken);
            } catch (err) {
                setError('Failed to fetch token details');
                console.error('Error fetching token:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, [params.id]);

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading token details...</p>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="error-state">
                <div className="error-icon">⚠️</div>
                <p className="error">{error || 'Token not found'}</p>
                <button onClick={() => router.back()} className="back-button">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <main className="token-details-container">
            <div className="token-details-content">
                <button onClick={() => router.back()} className="back-button">
                    ← Back to All Tokens
                </button>

                <div className="token-details-card">
                    <div className="token-header">
                        <h1>{token.asset_name || `Asset #${token.assetId}`}</h1>
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

                    <div className="token-info-grid">
                        <div className="info-section">
                            <h2>Token Information</h2>
                            <div className="info-row">
                                <span className="info-label">Asset ID:</span>
                                <span className="info-value">{token.assetId}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Token Name:</span>
                                <span className="info-value">{token.asset_name || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Unit Name:</span>
                                <span className="info-value">{token.unit_name || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="info-section">
                            <h2>Creator Details</h2>
                            <div className="info-row">
                                <span className="info-label">Creator Address:</span>
                                <span className="info-value address">{token.creator_address}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Created At:</span>
                                <span className="info-value">{new Date(token.created_at).toLocaleString()}</span>
                            </div>
                        </div>

                        {token.metadata_url && (
                            <div className="info-section">
                                <h2>Media Information</h2>
                                <div className="info-row">
                                    <span className="info-label">Media Type:</span>
                                    <span className="info-value">
                                        {token.metadata_url.endsWith('.mp4') ? 'Video' : 'Image'}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Media URL:</span>
                                    <a href={token.metadata_url} target="_blank" rel="noopener noreferrer" className="info-value link">
                                        View Media
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .token-details-container {
                    background: linear-gradient(135deg, #0e101c 0%, #1a1d29 100%);
                    color: white;
                    padding: 2rem;
                    min-height: calc(100vh - 100px);
                }

                .token-details-content {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding-top: 1rem;
                }

                .back-button {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    margin-bottom: 2rem;
                }

                .back-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                }

                .token-details-card {
                    background: linear-gradient(145deg, #1a1d29, #242731);
                    padding: 2rem;
                    border-radius: 16px;
                    border: 1px solid #333;
                }

                .token-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .token-header h1 {
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .token-symbol {
                    color: #a0a0a0;
                    font-size: 1.2rem;
                }

                .token-media-container {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .token-media {
                    max-width: 100%;
                    max-height: 400px;
                    border-radius: 12px;
                    object-fit: contain;
                    background: #0e101c;
                }

                .token-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .info-section {
                    background: rgba(26, 29, 41, 0.5);
                    padding: 1.5rem;
                    border-radius: 12px;
                }

                .info-section h2 {
                    color: #4f46e5;
                    font-size: 1.2rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #333;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .info-row:last-child {
                    border-bottom: none;
                }

                .info-label {
                    color: #a0a0a0;
                    font-size: 0.9rem;
                }

                .info-value {
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-align: right;
                    margin-left: 1rem;
                    word-break: break-all;
                }

                .info-value.address {
                    font-family: monospace;
                    font-size: 0.85rem;
                }

                .info-value.link {
                    color: #4f46e5;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .info-value.link:hover {
                    color: #7c3aed;
                    text-decoration: underline;
                }

                .loading-state, .error-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: rgba(26, 29, 41, 0.5);
                    border-radius: 12px;
                    border: 1px solid #333;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #333;
                    border-top: 3px solid #4f46e5;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .token-details-container {
                        padding: 1rem;
                    }

                    .token-details-card {
                        padding: 1.5rem;
                    }

                    .token-header h1 {
                        font-size: 2rem;
                    }

                    .token-info-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .info-row {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .info-value {
                        text-align: left;
                        margin-left: 0;
                    }
                }
            `}</style>
        </main>
    );
} 