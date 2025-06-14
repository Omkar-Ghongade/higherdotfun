'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface CreatedToken {
    id: string;
    creator_address: string;
    asset_id: string; // stored as string in Supabase
    asset_name: string;
    unit_name: string;
    metadata_url?: string;
    created_at: string;
}

interface AllTokenProps {
    searchTerm: string;
}

export default function AllToken({ searchTerm }: AllTokenProps) {
    const [tokens, setTokens] = useState<CreatedToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const tokensPerPage = 9; // 3 rows × 3 columns

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

    // Filter tokens based on search term
    const filteredTokens = tokens.filter(token => 
        token.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.unit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.assetId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Update pagination calculations to use filtered tokens
    const totalPages = Math.ceil(filteredTokens.length / tokensPerPage);
    const startIndex = (currentPage - 1) * tokensPerPage;
    const endIndex = startIndex + tokensPerPage;
    const currentTokens = filteredTokens.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const handleTokenClick = (tokenId: string) => {
        if (!tokenId) {
            console.error('Token ID is undefined');
            return;
        }
        router.push(`/token/${tokenId}`);
    };

    return (
        <main className="all-tokens-container">
            <div className="all-tokens-content">
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
                    <>
                        <div className="tokens-grid">
                            {currentTokens.map(token => (
                                <div 
                                    key={token.id} 
                                    className="token-card"
                                    onClick={() => handleTokenClick(token.id)}
                                    style={{ cursor: 'pointer' }}
                                >
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
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                >
                                    ← Previous
                                </button>

                                <div className="pagination-info">
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <span className="token-count">({tokens.length} tokens total)</span>
                                </div>

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="pagination-button"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style jsx>{`
                .all-tokens-container {
                    background: linear-gradient(135deg, #0e101c 0%, #1a1d29 100%);
                    color: white;
                    padding: 2rem;
                    min-height: calc(100vh - 100px);
                }

                .all-tokens-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-top: 1rem;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                h1 {
                    font-size: 3rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .header-section > p {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    color: #a0a0a0;
                    line-height: 1.6;
                }

                /* Empty/Loading/Error States */
                .empty-state, .loading-state, .error-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: rgba(26, 29, 41, 0.5);
                    border-radius: 12px;
                    border: 1px solid #333;
                }

                .empty-icon, .error-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
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

                .empty-state h3 {
                    color: #4f46e5;
                    margin-bottom: 0.5rem;
                    font-size: 1.5rem;
                }

                /* Token Grid */
                .tokens-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .token-card {
                    background: linear-gradient(145deg, #1a1d29, #242731);
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #333;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .token-card:hover {
                    transform: translateY(-5px);
                    border-color: #4f46e5;
                    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.2);
                }

                .token-header {
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .token-header h3 {
                    margin: 0;
                    color: #4f46e5;
                    font-size: 1.3rem;
                    font-weight: 600;
                }

                .token-symbol {
                    color: #a0a0a0;
                    font-size: 0.9rem;
                    font-weight: 400;
                }

                .token-media-container {
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .token-media {
                    width: 100%;
                    height: 180px;
                    border-radius: 8px;
                    object-fit: cover;
                    background: #0e101c;
                }

                .token-info {
                    margin-bottom: 1.5rem;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    padding: 0.25rem 0;
                }

                .info-label {
                    color: #a0a0a0;
                    font-size: 0.9rem;
                }

                .info-value {
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .metadata-link {
                    color: #4f46e5;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .metadata-link:hover {
                    color: #7c3aed;
                    text-decoration: underline;
                }

                /* Pagination */
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 2rem;
                    margin-top: 3rem;
                    padding: 2rem 0;
                }

                .pagination-button {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .pagination-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                }

                .pagination-button:disabled {
                    background: #374151;
                    cursor: not-allowed;
                    opacity: 0.6;
                    transform: none;
                }

                .pagination-info {
                    text-align: center;
                }

                .pagination-info span {
                    display: block;
                    color: #a0a0a0;
                }

                .token-count {
                    font-size: 0.85rem;
                    margin-top: 0.25rem;
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .tokens-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .all-tokens-container {
                        padding: 1.5rem;
                    }
                    
                    h1 {
                        font-size: 2.5rem;
                    }
                    
                    .tokens-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    
                    .pagination {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }

                @media (max-width: 640px) {
                    .all-tokens-container {
                        padding: 1rem;
                    }
                    
                    h1 {
                        font-size: 2rem;
                    }
                    
                    .token-card {
                        padding: 1rem;
                    }
                }
            `}</style>
        </main>
    );
}