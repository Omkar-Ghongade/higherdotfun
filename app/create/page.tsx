'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import { useWallet } from '../components/useWallet';

export default function CreateTokenPage() {
  const { account } = useWallet();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4'];
    const maxImageSize = 15 * 1024 * 1024; // 15MB
    const maxVideoSize = 30 * 1024 * 1024; // 30MB

    if (
      allowedImageTypes.includes(selected.type) &&
      selected.size <= maxImageSize
    ) {
      setFile(selected);
      setFileError(null);
    } else if (
      allowedVideoTypes.includes(selected.type) &&
      selected.size <= maxVideoSize
    ) {
      setFile(selected);
      setFileError(null);
    } else {
      setFile(null);
      setFileError(
        'Invalid file. Images: JPG, GIF, PNG max 15MB. Videos: MP4 max 30MB.'
      );
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    if (!file) {
      alert('Please upload an image or video file');
      return;
    }
    alert(
      `Creating token:\nName: ${name}\nSymbol: ${symbol}\nSupply: ${supply}\nFile: ${file.name}`
    );
    // TODO: Implement Algorand token creation & file upload logic here
  }

  return (
    <>
      <Header />
      <main className="create-container">
        <div className="create-content">
          <h1>Create New Coin</h1>
          <p>
            Choose carefully, these details can't be changed once the coin is
            created.
          </p>

          <form onSubmit={handleSubmit} className="create-form">
            <label>
              Token Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={30}
              />
            </label>

            <label>
              Symbol
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
                maxLength={10}
              />
            </label>

            <label>
              Total Supply
              <input
                type="number"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                required
                min={1}
              />
            </label>

            <label>
              Select Image or Video to Upload
              <input
                type="file"
                accept=".jpg,.jpeg,.gif,.png,.mp4"
                onChange={handleFileChange}
                required
              />
            </label>

            {fileError && <p className="error">{fileError}</p>}

            {file && (
              <p className="file-info">
                Selected file:{' '}
                <strong>{file.name}</strong> (
                {(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}

            <button type="submit" disabled={!account}>
              Create Token
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .create-container {
          background: #0e101c;
          color: white;
          padding: 2rem;
          min-height: calc(100vh - 100px);
        }

        .create-content {
          max-width: 600px;
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
          margin-bottom: 2.5rem;
          text-align: center;
          color: #a0a0a0;
          line-height: 1.5;
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        label {
          display: flex;
          flex-direction: column;
          font-weight: 600;
          font-size: 1rem;
          color: white;
        }

        input[type="text"],
        input[type="number"] {
          margin-top: 0.5rem;
          padding: 0.875rem 1rem;
          border: 2px solid #333;
          border-radius: 8px;
          background: #1a1d29;
          color: white;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        input[type="text"]:focus,
        input[type="number"]:focus {
          outline: none;
          border-color: #4f46e5;
        }

        input[type="file"] {
          margin-top: 0.5rem;
          padding: 0.75rem;
          border: 2px dashed #333;
          border-radius: 8px;
          background: #1a1d29;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        input[type="file"]:hover {
          border-color: #4f46e5;
        }

        button {
          padding: 1rem 2rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 1rem;
        }

        button:hover:not(:disabled) {
          background: #6366f1;
        }

        button:disabled {
          background: #555;
          cursor: not-allowed;
        }

        .error {
          color: #ef4444;
          font-size: 0.9rem;
          margin: 0;
        }

        .file-info {
          color: #10b981;
          font-size: 0.9rem;
          margin: 0;
        }

        /* Tablet styles */
        @media (max-width: 768px) {
          .create-container {
            padding: 1.5rem;
          }

          .create-content {
            max-width: 100%;
            padding-top: 0.5rem;
          }

          h1 {
            font-size: 2rem;
          }

          p {
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .create-form {
            gap: 1.25rem;
          }

          input[type="text"],
          input[type="number"] {
            padding: 0.75rem 0.875rem;
            font-size: 0.95rem;
          }

          button {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }

        /* Mobile styles */
        @media (max-width: 640px) {
          .create-container {
            padding: 1rem;
          }

          .create-content {
            padding-top: 0.25rem;
          }

          h1 {
            font-size: 1.75rem;
            margin-bottom: 0.75rem;
          }

          p {
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
          }

          .create-form {
            gap: 1rem;
          }

          label {
            font-size: 0.95rem;
          }

          input[type="text"],
          input[type="number"] {
            padding: 0.75rem;
            font-size: 0.9rem;
          }

          input[type="file"] {
            padding: 0.625rem;
            font-size: 0.85rem;
          }

          button {
            padding: 0.75rem 1.25rem;
            font-size: 0.95rem;
          }

          .error,
          .file-info {
            font-size: 0.85rem;
          }
        }

        /* Small mobile styles */
        @media (max-width: 480px) {
          .create-container {
            padding: 0.75rem;
          }

          h1 {
            font-size: 1.5rem;
          }

          p {
            font-size: 0.9rem;
            margin-bottom: 1.25rem;
          }

          input[type="text"],
          input[type="number"] {
            padding: 0.625rem;
            font-size: 0.85rem;
          }

          input[type="file"] {
            padding: 0.5rem;
            font-size: 0.8rem;
          }

          button {
            padding: 0.625rem 1rem;
            font-size: 0.9rem;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          h1 {
            font-size: 1.35rem;
          }

          p {
            font-size: 0.85rem;
          }

          label {
            font-size: 0.9rem;
          }

          input[type="text"],
          input[type="number"] {
            font-size: 0.8rem;
          }

          .error,
          .file-info {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}