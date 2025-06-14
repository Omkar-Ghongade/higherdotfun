'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import AllToken from './components/AllToken';
import TokenFeed from './components/TokenFeed';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  // handleSearch is no longer explicitly called for filtering,
  // as the filtering will happen directly in TokenFeed based on searchTerm.
  // We keep it here as a placeholder if you need to trigger other actions on search.
  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <Header />
      <main className="landing-main">
        <Link href="/create" className="landing-title-link">
          <h1 className="landing-title">[start a new coin]</h1>
        </Link>

        <Link href="/remint" className="landing-title-link">
          <h1 className="landing-title">[on demand token generation]</h1>
        </Link>

        {/* Search Input and Button */}
        <div className="search-container">
          <input
            type="text"
            placeholder="search for token"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
        </div>

        <AllToken searchTerm={searchTerm} />
        {/* Pass the searchTerm to TokenFeed */}
        {/* <TokenFeed /> */}

      </main>

      <style jsx>{`
        .landing-main {
          max-width: 1100px;
          margin: 2rem auto;
          padding: 0 1rem;
          color: white;
        }
        .landing-title {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          margin-top: 1rem;
          text-align: center;
          color: white;
        }
        .search-container {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
        }
        @media (max-width: 640px) {
          .search-container {
            flex-direction: column;
            gap: 1rem;
          }
          .landing-title {
            font-size: 1.5rem;
          }
          .search-input {
            padding: 0.875rem 1.25rem;
            font-size: 1rem;
          }
          .search-button {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }
        @media (max-width: 480px) {
          .landing-main {
            padding: 0 0.75rem;
          }
          .landing-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }
          .search-input {
            padding: 0.75rem 1rem;
          }
          .search-button {
            padding: 0.75rem 1.25rem;
          }
        }
        .search-input {
          flex: 1;
          padding: 1rem 1.5rem;
          background-color: #4ade80;
          color: black;
          border: none;
          border-radius: 0.5rem;
          font-size: 1.125rem;
          outline: none;
          text-align: center;
        }
        .search-input::placeholder {
          color: rgba(0, 0, 0, 0.7);
        }
        .search-input:focus {
          box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.5);
        }
        .search-button {
          padding: 1rem 2rem;
          background-color: #4ade80;
          color: black;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
          outline: none;
        }
        .search-button:hover {
          background-color: #22c55e;
        }
        .search-button:focus {
          box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.5);
        }
        .landing-title-link {
          text-decoration: none;
          color: white;
          cursor: pointer;
          display: block;
        }
      `}</style>
    </>
  );
}