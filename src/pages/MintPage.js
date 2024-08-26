import React, { useState } from 'react';
import '../styles/MintPage.css';
import { ethers } from 'ethers';
import nftAbi from './NFT_ABI.json';
import WalletConnectionPrompt from '../components/WalletConnectionPrompt';

const CONTRACT_ADDRESS = "0x17E914af9245de9371C7D4F1963c5ea85A56b5A8";

const PINATA_API_JWT = process.env.REACT_APP_PINATA_API_JWT;

const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PINATA_API_JWT}`,
            },
            body: formData,
        });

        const data = await response.json();
        return `ipfs://${data.IpfsHash}`;
    } catch (error) {
        console.error("IPFS upload error:", error);
        return null;
    }
};

function MintPage({ account }) {
    const [image, setImage] = useState(null);
    const [minting, setMinting] = useState(false);
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState('');

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setStatus('');
        setStatusType('');
    };

    const handleMint = async () => {
        if (!image) {
            setStatus('Please upload an NFT image first.');
            setStatusType('error');
            return;
        }

        const metadataURI = await uploadToIPFS(image);
        if (!metadataURI) {
            setStatus('Image upload failed.');
            setStatusType('error');
            return;
        }

        setMinting(true);
        setStatus('Minting NFT...');
        setStatusType('');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const nftContract = new ethers.Contract(CONTRACT_ADDRESS, nftAbi, signer);

            const tx = await nftContract.mintNFT(metadataURI, {
                gasLimit: 3000000
            });

            await tx.wait();
            setMinting(false);
            setStatus('NFT minted successfully!');
            setStatusType('success');
        } catch (error) {
            console.error("Error during minting:", error);
            setMinting(false);
            setStatus(`Error: ${error.message}`);
            setStatusType('error');
        }
    };

    if (!account) {
        return <WalletConnectionPrompt />;
    }

    return (
        <div className="mint-page">
            <h1>Mint NFT on Scroll Network</h1>

            <div className="upload-section">
                <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                />
                <label htmlFor="file-upload" className="upload-button">
                    {image ? 'Image Selected' : 'Click to Upload Image'}
                </label>
                {image && <p className="image-name">Uploaded: {image.name}</p>}
            </div>

            <button onClick={handleMint} className="mint-button" disabled={minting}>
                {minting ? 'Minting...' : 'Mint NFT'}
            </button>

            {status && <p className={`status ${statusType}`}>{status}</p>}
        </div>
    );
}

export default MintPage;
