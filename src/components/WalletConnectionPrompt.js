import React from 'react';
import './WalletConnection.css'; // CSS dosyasını import ediyoruz

function WalletConnection() {
    return (
        <div className="wallet-connection">
            <p className="wallet-message">
                Please connect your wallet to continue.
            </p>
        </div>
    );
}

export default WalletConnection;
