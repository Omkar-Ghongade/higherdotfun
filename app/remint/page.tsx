'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header'; // Adjust path if necessary
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

export default function MyTokensPage() {
    const { account, peraWallet } = useWallet();
    const [ownedTokens, setOwnedTokens] = useState<AssetData[]>([]);
    const [loadingTokens, setLoadingTokens] = useState(true);
    const [errorTokens, setErrorTokens] = useState<string | null>(null);
    const [remintingAssetId, setRemintingAssetId] = useState<number | null>(null);
    const [mintAmountInput, setMintAmountInput] = useState<string>(''); // Changed to mintAmountInput
    const [loadingRemint, setLoadingRemint] = useState(false);
    const [requestAssetIdInput, setRequestAssetIdInput] = useState<string>(''); // New state for request input


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
            if(assetInfo.params.creator!=account){
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
            }else{
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
            <Header />
            <main className="my-tokens-container">
                <div className="my-tokens-content">
                    <h1>Your Owned Tokens</h1>
                    <p>
                        Displaying all Algorand Standard Assets (ASAs) associated with your connected wallet.
                    </p>

                    {!account ? (
                        <p>Please connect your wallet to see your tokens.</p>
                    ) : loadingTokens ? (
                        <p>Loading tokens...</p>
                    ) : errorTokens ? (
                        <p className="error">{errorTokens}</p>
                    ) : ownedTokens.length === 0 ? (
                        <p>You don't own any tokens yet.</p>
                    ) : (
                        <div className="tokens-list">
                            {ownedTokens.map(token => (
                                <div key={token.assetId} className="token-item">
                                    <h3>{token.name || `Asset ID: ${token.assetId}`} ({token.unitName})</h3>
                                    <p>Your Amount: {formatAmountWithDecimals(token.amount, token.decimals)}</p>
                                    <p>Total Supply: {token.total !== undefined ? formatAmountWithDecimals(token.total, token.decimals) : 'N/A'}</p>
                                    <p>Asset ID: {token.assetId}</p>
                                    {token.url && (
                                        token.url.includes('.mp4') ? (
                                            <video controls src={token.url} className="token-media" />
                                        ) : (
                                            <img src={token.url} alt={token.name || 'Token Image'} className="token-media" />
                                        )
                                    )}

                                    {/* Minting Additional Tokens Section */}
                                    <div className="remint-section"> {/* Reusing remint-section class for styling */}
                                        {remintingAssetId === token.assetId ? (
                                            account === token.manager ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        placeholder="Amount to Mint (max 5)"
                                                        value={mintAmountInput}
                                                        onChange={(e) => setMintAmountInput(e.target.value)}
                                                        min={1}
                                                        max={5} // Max 5 tokens at once
                                                        className="remint-input"
                                                        disabled={loadingRemint}
                                                    />
                                                    <button
                                                        onClick={() => handleMintAdditional(token)}
                                                        disabled={loadingRemint || !mintAmountInput || BigInt(mintAmountInput) <= 0 || BigInt(mintAmountInput) > 5}
                                                        className="remint-button primary"
                                                    >
                                                        {loadingRemint ? 'Minting...' : 'Confirm Mint'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setRemintingAssetId(null); setMintAmountInput(''); }}
                                                        disabled={loadingRemint}
                                                        className="remint-button secondary"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <p className="error">Only the manager can mint additional tokens.</p>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => { setRemintingAssetId(token.assetId); setMintAmountInput(''); }} // Clear input when opening
                                                disabled={loadingRemint || !account}
                                                className="remint-button"
                                            >
                                                Mint More
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <p className="connected-account-display">Connected account: {account}</p>

            <div className="request-section">
              <input
                  type="text"
                  placeholder="Enter Asset ID to request details..."
                  className="request-input"
                  value={requestAssetIdInput}
                  onChange={(e) => setRequestAssetIdInput(e.target.value)}
              />
              <button
                  className="request-button"
                  onClick={handleRequestAssetDetails}
                  disabled={!requestAssetIdInput || isNaN(parseInt(requestAssetIdInput, 10))}
              >
                  Request
              </button>
          </div>

            <style jsx>{`
                .my-tokens-container {
                    background: #0e101c;
                    color: white;
                    padding: 2rem;
                    min-height: calc(100vh - 100px);
                }

                .my-tokens-content {
                    max-width: 800px;
                    margin: 0 auto;
                    padding-top: 1rem;
                }

                h1 {
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                p {
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    color: #a0a0a0;
                    line-height: 1.5;
                }

                .connected-account-display {
                    text-align: center;
                    margin-top: 2rem;
                    font-size: 0.9rem;
                    color: #a0a0a0;
                }

                .tokens-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                .token-item {
                    background: #1a1d29;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border: 1px solid #333;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .token-item h3 {
                    margin-top: 0;
                    color: #4f46e5;
                    font-size: 1.3rem;
                    margin-bottom: 0.75rem;
                }

                .token-item p {
                    text-align: center;
                    color: white;
                    margin-bottom: 0.5rem;
                    font-size: 0.95rem;
                }

                .token-media {
                    max-width: 100%;
                    height: auto;
                    max-height: 200px;
                    border-radius: 4px;
                    margin-top: 1rem;
                    object-fit: contain;
                }

                .remint-section {
                    margin-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    width: 100%;
                    max-width: 200px; /* Constrain width for inputs/buttons */
                }

                .remint-input {
                    padding: 0.6rem 0.8rem;
                    border: 1px solid #4f46e5;
                    border-radius: 5px;
                    background-color: #0e101c;
                    color: white;
                    font-size: 0.9rem;
                    width: 100%;
                }

                .remint-button {
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: background-color 0.2s ease;
                    width: 100%;
                }

                .remint-button.primary {
                    background: #4f46e5;
                    color: white;
                }

                .remint-button.primary:hover:not(:disabled) {
                    background: #6366f1;
                }

                .remint-button.secondary {
                    background: #333;
                    color: white;
                }

                .remint-button.secondary:hover:not(:disabled) {
                    background: #555;
                }

                .remint-button:disabled {
                    background: #555;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .error {
                    color: #ef4444;
                    font-size: 0.9rem;
                    margin-top: 1rem;
                }

                /* Responsive styles */
                @media (max-width: 768px) {
                    .my-tokens-container {
                        padding: 1.5rem;
                    }
                    .my-tokens-content {
                        max-width: 100%;
                    }
                    h1 {
                        font-size: 2rem;
                    }
                    p {
                        font-size: 1rem;
                    }
                    .tokens-list {
                        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    }
                }

                @media (max-width: 640px) {
                    .my-tokens-container {
                        padding: 1rem;
                    }
                    h1 {
                        font-size: 1.75rem;
                    }
                    p {
                        font-size: 0.95rem;
                    }
                    .tokens-list {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}