'use client';

import TokenDetails from '../../components/TokenDetails';

export default function TokenPage({ params }: { params: { id: string } }) {
    if (!params.id) {
        return (
            <div className="error-state">
                <div className="error-icon">⚠️</div>
                <p className="error">Invalid token ID</p>
            </div>
        );
    }
    return <TokenDetails params={params} />;
} 