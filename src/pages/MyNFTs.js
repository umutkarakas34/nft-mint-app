import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import nftAbi from './NFT_ABI.json';
import './MyNFTs.css';
import WalletConnectionPrompt from '../components/WalletConnectionPrompt';
import loadingGif from '../assets/loading.gif'; // Yükleniyor gifini buradan çağırıyoruz

function MyNFTs({ account }) {
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const modalRef = useRef(null);

    const CONTRACT_ADDRESS = '0x17E914af9245de9371C7D4F1963c5ea85A56b5A8';

    function convertIPFSToHTTP(tokenURI) {
        if (tokenURI.startsWith("ipfs://")) {
            return tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        return tokenURI;
    }

    const fetchNFTs = async () => {
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const nftContract = new ethers.Contract(CONTRACT_ADDRESS, nftAbi, signer);

            const balance = await nftContract.balanceOf(account);
            const nftList = [];

            for (let i = 0; i < balance; i++) {
                try {
                    let tokenURI = await nftContract.tokenURI(i);
                    const formattedTokenURI = convertIPFSToHTTP(tokenURI);

                    const metadataResponse = await Promise.race([
                        fetch(formattedTokenURI),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
                    ]);

                    const contentType = metadataResponse.headers.get("content-type");
                    let metadata = {};

                    if (contentType && contentType.includes("application/json")) {
                        metadata = await metadataResponse.json();
                    } else if (contentType && contentType.includes("image")) {
                        metadata.image = formattedTokenURI;
                        metadata.name = `NFT #${i}`;
                    } else {
                        throw new Error("Unsupported content type");
                    }

                    nftList.push({
                        tokenId: i,
                        image: metadata.image || 'https://sepolia.scrollscan.com/images/main/nft-placeholder.svg',
                        title: metadata.name || `NFT #${i}`,
                    });
                } catch (error) {
                    nftList.push({
                        tokenId: i,
                        image: 'https://sepolia.scrollscan.com/images/main/nft-placeholder.svg',
                        title: `NFT #${i}`,
                    });
                }
            }

            setNfts(nftList);
        } catch (err) {
            setError("An error occurred while fetching NFTs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (account) {
            fetchNFTs();
        }
    }, [account]);

    const openModal = (nft) => {
        setSelectedNFT(nft);
        if (modalRef.current) {
            modalRef.current.style.display = 'flex'; // Modalı flex yapısıyla açıyoruz
        }
    };

    const closeModal = () => {
        setSelectedNFT(null);
        if (modalRef.current) {
            modalRef.current.style.display = 'none'; // Modalı kapatıyoruz
        }
    };

    if (!account) {
        return <WalletConnectionPrompt />;
    }

    return (
        <div className="my-nfts-page">
            {loading ? (
                <div className="loading-section">
                    <img src={loadingGif} alt="Loading..." className="loading-gif" /> {/* Sadece gif */}
                </div>
            ) : (
                <>
                    <h1>Your NFTs Minted on Our Platform - Scroll Sepolia Testnet</h1> {/* Başlık sadece içerik yüklendiğinde gelir */}
                    {error ? (
                        <p>{error}</p>
                    ) : (
                        <div className="nft-gallery-wrapper">
                            <div className="nft-gallery">
                                {nfts.length > 0 ? (
                                    nfts.map((nft, index) => (
                                        <div key={index} className="nft-item" onClick={() => openModal(nft)}>
                                            <img src={nft.image || ''} alt={`NFT ${index}`} />
                                            <p>{nft.title || `NFT #${nft.tokenId}`}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No NFTs found.</p>
                                )}
                            </div>

                            {selectedNFT && (
                                <div ref={modalRef} className="modal">
                                    <div className="modal-content">
                                        <span className="close" onClick={closeModal}>&times;</span>
                                        <img src={selectedNFT.image} alt={selectedNFT.title} />
                                        <p className="nft-title">{selectedNFT.title}</p>
                                        <a href={`https://sepolia.scrollscan.com/nft/${CONTRACT_ADDRESS}/${selectedNFT.tokenId}`} target="_blank" rel="noopener noreferrer" className="scrollscan-link">
                                            View on ScrollScan
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MyNFTs;
