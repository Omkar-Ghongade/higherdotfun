'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../components/useWallet'; // Adjust path if necessary
import algosdk from "algosdk";


const algod = new algosdk.Algodv2("", "https://testnet-api.4160.nodely.dev", "443");

interface AssetData {
    assetId: number;
    amount: bigint;
    name?: string;
    unitName?: string;
    url?: string;
    decimals?: number;
    manager?: string;
    total?: bigint; // The total supply from asset info
    reserve?: string;
    freeze?: string;
    clawback?: string;
}

export default function TokenFeed() {
    const { account, peraWallet } = useWallet();
    const [ownedTokens, setOwnedTokens] = useState<AssetData[]>([]);
    const [loadingTokens, setLoadingTokens] = useState(true);
    const [errorTokens, setErrorTokens] = useState<string | null>(null);
    const [remintingAssetId, setRemintingAssetId] = useState<number | null>(null);
    const [mintAmountInput, setMintAmountInput] = useState<string>(''); // Changed to mintAmountInput
    const [loadingRemint, setLoadingRemint] = useState(false);
    const [requestAssetIdInput, setRequestAssetIdInput] = useState<string>(''); // New state for request input

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const tokensPerPage = 9; // 3 rows × 3 columns

    useEffect(() => {
        async function fetchOwnedTokens() {
            if (!account) {
                setOwnedTokens([]);
                setLoadingTokens(false);
                return;
            }

            setLoadingTokens(true);
            setErrorTokens(null);
            try {
                const accountInfo = await algod.accountInformation(account).do();
                const assets = accountInfo['assets'] || [];

                const tokenPromises = assets.map(async (asset: any) => {
                    const assetId = asset['assetId'];
                    const amount = BigInt(asset['amount']);

                    try {
                        const assetInfo = await algod.getAssetByID(assetId).do();
                        const params = assetInfo.params;
                        return {
                            assetId,
                            amount,
                            name: params['name'],
                            unitName: params['unitName'],
                            url: params['url'],
                            decimals: params['decimals'],
                            manager: params['manager'],
                            total: BigInt(params['total']),
                            reserve: params['reserve'],
                            freeze: params['freeze'],
                            clawback: params['clawback'],
                        };
                    } catch (detailError) {
                        console.warn(`Could not fetch details for asset ID ${assetId}:`, detailError);
                        return {
                            assetId,
                            amount,
                            name: 'Unknown Token',
                            unitName: '???',
                            url: '',
                            decimals: 0,
                            manager: undefined,
                            total: undefined,
                            reserve: undefined,
                            freeze: undefined,
                            clawback: undefined,
                        };
                    }
                });

                const fetchedTokens = await Promise.all(tokenPromises);
                setOwnedTokens(fetchedTokens);
            } catch (error: any) {
                console.error("Failed to fetch owned tokens:", error);
                setErrorTokens(`Failed to load your tokens: ${error.message || 'An unknown error occurred.'}`);
            } finally {
                setLoadingTokens(false);
            }
        }

        fetchOwnedTokens();
    }, [account]);

    // Pagination calculations
    const totalPages = Math.ceil(ownedTokens.length / tokensPerPage);
    const startIndex = (currentPage - 1) * tokensPerPage;
    const endIndex = startIndex + tokensPerPage;
    const currentTokens = ownedTokens.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        // Reset any open mint forms when changing pages
        setRemintingAssetId(null);
        setMintAmountInput('');
    };

    // Helper function to format BigInt amounts with decimals
    const formatAmountWithDecimals = (amount: bigint, decimals: number | undefined): string => {
        if (typeof decimals === 'undefined' || decimals === 0) {
            return amount.toString();
        }

        const divisor = BigInt(10) ** BigInt(decimals);
        const integerPart = amount / divisor;
        let fractionalPart = amount % divisor;

        let fractionalString = fractionalPart.toString().padStart(decimals, '0');
        fractionalString = fractionalString.replace(/0+$/, '');

        if (fractionalString === '') {
            return integerPart.toString();
        }

        return `${integerPart}.${fractionalString}`;
    };

    const handleMintAdditional = async (asset: AssetData) => {
        if (!account) {
            alert('Please connect your wallet.');
            return;
        }

        if (account !== asset.manager) {
            alert('You are not the manager of this asset and cannot mint additional tokens.');
            return;
        }

        if (remintingAssetId === asset.assetId && !mintAmountInput) {
            alert('Please enter the amount of tokens to mint.');
            return;
        }

        const mintAmount = BigInt(mintAmountInput);
        if (mintAmount <= 0) {
            alert('Amount to mint must be a positive number.');
            return;
        }

        if (mintAmount > 5) {
            alert('You can only mint a maximum of 5 tokens at once.');
            return;
        }

        // Calculate the new total supply
        const newTotalSupply = mintAmount;

        setLoadingRemint(true);
        try {
            const suggestedParams = await algod.getTransactionParams().do();
            const assetURL = asset.url;
            // Use makeAssetConfigTxnWithSuggestedParamsFromObject to update total supply
            const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                sender: account,
                suggestedParams,
                defaultFrozen: false,
                unitName: asset.unitName,
                assetName: asset.name,
                manager: account,
                reserve: account,
                freeze: account,
                clawback: account,
                assetURL,
                total: newTotalSupply,
                decimals: 0,
            });

            const singleTxnGroups = [{ txn, signers: [account] }];
            const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);

            const txId = await algod.sendRawTransaction(signedTxn).do();

            alert('Token created successfully!');
            window.location.reload(); // Refresh the page to show updated balances
        } catch (error: any) {
            console.error("Failed to mint additional tokens:", error);
            alert(`Failed to mint additional tokens: ${error.message || 'An unknown error occurred.'}`);
        } finally {
            setLoadingRemint(false);
            setRemintingAssetId(null);
            setMintAmountInput('');
        }
    };

    const handleRequestAssetDetails = async () => {
        if (!requestAssetIdInput) {
            alert('Please enter an Asset ID.');
            return;
        }

        const assetId = parseInt(requestAssetIdInput, 10);
        if (isNaN(assetId) || assetId <= 0) {
            alert('Please enter a valid positive Asset ID.');
            return;
        }

        console.log(`Fetching details for Asset ID: ${assetId}`);
        try {
            const assetInfo = await algod.getAssetByID(assetId).do();
            console.log(assetInfo)
            const suggestedParams = await algod.getTransactionParams().do();
            const assetURL = assetInfo.params.url;
            // Use makeAssetConfigTxnWithSuggestedParamsFromObject to update total supply
            if (assetInfo.params.creator != account) {
                const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                    sender: account,
                    suggestedParams,
                    defaultFrozen: false,
                    unitName: assetInfo.params.unitName,
                    assetName: assetInfo.params.name,
                    manager: assetInfo.params.creator,
                    reserve: assetInfo.params.creator,
                    freeze: assetInfo.params.creator,
                    clawback: assetInfo.params.creator,
                    assetURL,
                    total: 1,
                    decimals: 0,
                });
                const singleTxnGroups = [{ txn, signers: [account] }];
                const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);

                const txId = await algod.sendRawTransaction(signedTxn).do();
            } else {
                const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                    sender: account,
                    suggestedParams,
                    defaultFrozen: false,
                    unitName: assetInfo.params.unitName,
                    assetName: assetInfo.params.name,
                    manager: assetInfo.params.manager,
                    reserve: assetInfo.params.manager,
                    freeze: assetInfo.params.manager,
                    clawback: assetInfo.params.manager,
                    assetURL,
                    total: 1,
                    decimals: 0,
                });
                const singleTxnGroups = [{ txn, signers: [account] }];
                const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);

                const txId = await algod.sendRawTransaction(signedTxn).do();
            }


            // alert(`Asset details for ID ${assetId} fetched and logged to console.`);
        } catch (error: any) {
            console.error(`Failed to fetch details for Asset ID ${assetId}:`, error);
            alert(`Failed to fetch asset details: ${error.message || 'An unknown error occurred.'}`);
        }
    };

    return (
        <>
            <main className="my-tokens-container">
                <div className="my-tokens-content">
                    <div className="header-section">
                        <h1>Your Owned Tokens</h1>
                        <p>
                            Displaying all Algorand Standard Assets (ASAs) associated with your connected wallet.
                        </p>
                        {account && (
                            <div className="account-badge">
                                <span className="account-label">Connected:</span>
                                <span className="account-address">{account.slice(0, 6)}...{account.slice(-4)}</span>
                            </div>
                        )}
                    </div>

                    {!account ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔗</div>
                            <h3>Connect Your Wallet</h3>
                            <p>Please connect your wallet to see your tokens.</p>
                        </div>
                    ) : loadingTokens ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading your tokens...</p>
                        </div>
                    ) : errorTokens ? (
                        <div className="error-state">
                            <div className="error-icon">⚠️</div>
                            <p className="error">{errorTokens}</p>
                        </div>
                    ) : ownedTokens.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🪙</div>
                            <h3>No Tokens Found</h3>
                            <p>You don't own any tokens yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="tokens-grid">
                                {currentTokens.map(token => (
                                    <div key={token.assetId} className="token-card">
                                        <div className="token-header">
                                            <h3>{token.name || `Asset #${token.assetId}`}</h3>
                                            <span className="token-symbol">({token.unitName})</span>
                                        </div>

                                        {token.url && (
                                            <div className="token-media-container">
                                                {token.url.includes('.mp4') ? (
                                                    <video controls src={token.url} className="token-media" />
                                                ) : (
                                                    <img src={token.url} alt={token.name || 'Token Image'} className="token-media" />
                                                )}
                                            </div>
                                        )}

                                        <div className="token-info">
                                            <div className="info-row">
                                                <span className="info-label">Your Balance:</span>
                                                <span className="info-value">{formatAmountWithDecimals(token.amount, token.decimals)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Total Supply:</span>
                                                <span className="info-value">{token.total !== undefined ? formatAmountWithDecimals(token.total, token.decimals) : 'N/A'}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Asset ID:</span>
                                                <span className="info-value">{token.assetId}</span>
                                            </div>
                                        </div>

                                        {/* Minting Additional Tokens Section */}
                                        <div className="mint-section">
                                            {remintingAssetId === token.assetId ? (
                                                account === token.manager ? (
                                                    <div className="mint-form">
                                                        <input
                                                            type="number"
                                                            placeholder="Amount (max 5)"
                                                            value={mintAmountInput}
                                                            onChange={(e) => setMintAmountInput(e.target.value)}
                                                            min={1}
                                                            max={5}
                                                            className="mint-input"
                                                            disabled={loadingRemint}
                                                        />
                                                        <div className="mint-buttons">
                                                            <button
                                                                onClick={() => handleMintAdditional(token)}
                                                                disabled={loadingRemint || !mintAmountInput || BigInt(mintAmountInput) <= 0 || BigInt(mintAmountInput) > 5}
                                                                className="mint-button confirm"
                                                            >
                                                                {loadingRemint ? 'Minting...' : 'Confirm'}
                                                            </button>
                                                            <button
                                                                onClick={() => { setRemintingAssetId(null); setMintAmountInput(''); }}
                                                                disabled={loadingRemint}
                                                                className="mint-button cancel"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="error-text">Only the manager can mint tokens.</p>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => { setRemintingAssetId(token.assetId); setMintAmountInput(''); }}
                                                    disabled={loadingRemint || !account}
                                                    className="mint-button primary"
                                                >
                                                    Mint More
                                                </button>
                                            )}
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
                                        <span className="token-count">({ownedTokens.length} tokens total)</span>
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
            </main>

            {/* Asset Request Section */}
            <section className="asset-request-section">
                <div className="request-container">
                    <h2>Request/Opt-In to an Asset</h2>
                    <p>Enter an Asset ID to request and mint</p>
                    <div className="request-form">
                        <input
                            type="text"
                            placeholder="Enter Asset ID..."
                            className="request-input"
                            value={requestAssetIdInput}
                            onChange={(e) => setRequestAssetIdInput(e.target.value)}
                        />
                        <button
                            className="request-button"
                            onClick={handleRequestAssetDetails}
                            disabled={!requestAssetIdInput || isNaN(parseInt(requestAssetIdInput, 10))}
                        >
                            Request Details
                        </button>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .my-tokens-container {
                    background: linear-gradient(135deg, #0e101c 0%, #1a1d29 100%);
                    color: white;
                    padding: 2rem;
                    min-height: calc(100vh - 100px);
                }

                .my-tokens-content {
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

                .account-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(79, 70, 229, 0.1);
                    border: 1px solid rgba(79, 70, 229, 0.3);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.9rem;
                }

                .account-label {
                    color: #a0a0a0;
                }

                .account-address {
                    color: #4f46e5;
                    font-weight: 600;
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

                /* Mint Section */
                .mint-section {
                    margin-top: auto;
                }

                .mint-form {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .mint-input {
                    padding: 0.75rem;
                    border: 1px solid #4f46e5;
                    border-radius: 8px;
                    background-color: rgba(14, 16, 28, 0.8);
                    color: white;
                    font-size: 0.9rem;
                    width: 100%;
                }

                .mint-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .mint-button {
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    flex: 1;
                }

                .mint-button.primary {
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                }

                .mint-button.primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                }

                .mint-button.confirm {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .mint-button.cancel {
                    background: #374151;
                    color: white;
                }

                .mint-button.cancel:hover:not(:disabled) {
                    background: #4b5563;
                }

                .mint-button:disabled {
                    background: #374151;
                    cursor: not-allowed;
                    opacity: 0.6;
                    transform: none;
                }

                .error-text {
                    color: #ef4444;
                    font-size: 0.85rem;
                    text-align: center;
                    margin: 0;
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

                /* Asset Request Section */
                .asset-request-section {
                    background: linear-gradient(135deg, #1a1d29, #242731);
                    padding: 3rem 2rem;
                    margin-top: 2rem;
                }

                .request-container {
                    max-width: 600px;
                    margin: 0 auto;
                    text-align: center;
                }

                .request-container h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: #4f46e5;
                }

                .request-container p {
                    color: #a0a0a0;
                    margin-bottom: 2rem;
                }

                .request-form {
                    display: flex;
                    gap: 1rem;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .request-input {
                    flex: 1;
                    padding: 1rem;
                    border: 1px solid #4f46e5;
                    border-radius: 8px;
                    background-color: rgba(14, 16, 28, 0.8);
                    color: white;
                    font-size: 1rem;
                }

                .request-button {
                    padding: 1rem 1.5rem;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .request-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                }

                .request-button:disabled {
                    background: #374151;
                    cursor: not-allowed;
                    opacity: 0.6;
                    transform: none;
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .tokens-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .my-tokens-container {
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
                    
                    .request-form {
                        flex-direction: column;
                    }
                }

                @media (max-width: 640px) {
                    .my-tokens-container {
                        padding: 1rem;
                    }
                    
                    h1 {
                        font-size: 2rem;
                    }
                    
                    .token-card {
                        padding: 1rem;
                    }
                    
                    .asset-request-section {
                        padding: 2rem 1rem;
                    }
                }
            `}</style>
        </>
    );
}