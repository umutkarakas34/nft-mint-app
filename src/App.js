import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ethers } from 'ethers';
import './App.css';
import MintPage from './pages/MintPage';
import MyNFTs from './pages/MyNFTs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const [account, setAccount] = useState(null);
  const [copied, setCopied] = useState(false);  // Copied state

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install Metamask to use this feature.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);  // "Copied!" durumunu etkinleştir
    setTimeout(() => setCopied(false), 2000);  // 2 saniye sonra durumu eski haline getir
  };

  return (
    <Router>
      <div className="app">
        <Navbar
          account={account}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          copyAddressToClipboard={copyAddressToClipboard}
          copied={copied}  // Copied state'i Navbar'a gönder
        />
        <div className="content">
          <Routes>
            <Route path="/mint" element={<MintPage account={account} />} />
            <Route path="/my-nfts" element={<MyNFTs account={account} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
