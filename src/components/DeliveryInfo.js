// DeliveryInfo.js
import React from 'react';
import deliveryIcon from '../icons/delivery.jpg';
import walletIcon from '../icons/wallet.png';
import '../css/DeliveryInfo.css'; // Make sure to create this CSS file

const DeliveryInfo = () => {
  return (
    <div className="delivery-info">
      {/* First icon and text */}
      <div className="delivery-option">
        <img src={deliveryIcon} alt="Delivery Icon" className="icon" />
        <div className="text">
          <p>DELIVERY ALL OVER LEBANON</p>
          <p>All orders will be delivered in 5 days</p>
        </div>
      </div>

      {/* Second icon and text */}
      <div className="delivery-option">
        <img src={walletIcon} alt="Cash on Delivery Icon" className="icon" />
        <div className="text">
          <p>CASH ON DELIVERY</p>
          <p>Delivery charge 3$</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;
