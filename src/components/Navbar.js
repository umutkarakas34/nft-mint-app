import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Navbar({ account, connectWallet, disconnectWallet, copyAddressToClipboard, copied }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/mint" className="nav-button">NFT Mint</Link>
        <Link to="/my-nfts" className="nav-button">My NFTs</Link>
      </div>
      <div className="nav-right">
        {account ? (
          <div className="wallet-info">
            <span className="wallet-address" onClick={toggleDropdown}>
              {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
            </span>
            {dropdownOpen && (
              <div className="wallet-dropdown">
                <button onClick={copyAddressToClipboard}>
                  <FontAwesomeIcon icon={faCopy} />
                  {copied ? "Copied!" : "Copy Address"} {/* Dinamik metin */}
                </button>
                <button onClick={disconnectWallet} className="disconnect-btn">
                  <FontAwesomeIcon icon={faSignOutAlt} /> Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={connectWallet} className="btn-connect">Connect Wallet</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
