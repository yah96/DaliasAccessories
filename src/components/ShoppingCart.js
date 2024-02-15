import React, { useEffect, useState } from 'react';
import '../css/ShoppingCart.css';
import AWS from 'aws-sdk'; // Import AWS SDK

const ShoppingCart = ({ updateCartItemsCount }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    // Fetch cart items from localStorage on component mount
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  // Calculate total price whenever cart items change
  useEffect(() => {
    AWS.config.update({
      accessKeyId: 'AKIAWNLSKT44HAX5OEYB',
      secretAccessKey: 'zXVR0J0X4+7OrAIFGJ5rBhsvgEWR5DY8fx22QWaA',
      region: 'eu-north-1', // e.g., 'us-east-1'
    });
    new AWS.SES({ apiVersion: '2010-12-01' });
    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice += parseFloat(item.price);
    });
    setTotalPrice(totalPrice);
  }, [cartItems]);

  // Function to remove item from shopping cart
  const removeFromCart = (index) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems.splice(index, 1); // Remove item at index
    setCartItems(updatedCartItems); // Update cartItems state
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems)); // Update local storage
    updateCartItemsCount();
  };

  // Function to handle checkout
  const handleCheckout = async () => {
    // Check if all required fields are filled
    if (!address || !firstName || !lastName) {
      window.alert('Please fill in all required fields.');
      return;
    }
  
    // Ask for confirmation before proceeding
    const confirmCheckout = window.confirm(`Are you sure you want to proceed with the checkout?\n\nTotal Price:$${totalPrice.toFixed(2)}\n\nItems:\n${cartItems.map(item => `- ${item.caption} - $${item.price}`).join('\n')}
    \n\nPhone Number: ${phoneNumber}\nAddress: ${address}\nFirst Name: ${firstName}\nLast Name: ${lastName}`);
    if (!confirmCheckout) {
      return;
    }
  
    // Send email using Amazon SES
    const ses = new AWS.SES({ region: 'eu-north-1' }); 
    const params = {
      Destination: {
        ToAddresses: ['yehya.houssen1996@gmail.com'], 
      },
      Message: {
        Body: {
          Text: {
            Data: `You got a new order!\n\nTotal Price:$${totalPrice.toFixed(2)}\n\nItems:\n${cartItems.map(item => `- ${item.caption} - $${item.price}`).join('\n')}
             \n\nPhone Number: ${phoneNumber}\nAddress: ${address}\nFirst Name: ${firstName}\nLast Name: ${lastName}`,
          },
        },
        Subject: {
          Data: 'New Order! ',
        },
      },
      Source: 'yehya.houssen1996@gmail.com',
    };
  
    try {
      await ses.sendEmail(params).promise();
      console.log('Email sent successfully');
      // Clear cart after successful checkout
      window.alert('Email sent successfully! You will be contacted as soon as possible.');
      setCartItems([]);
      updateCartItemsCount();
      localStorage.removeItem('cartItems');
      // Optionally, redirect the user to a confirmation page
    } catch (error) {
      console.error('Error sending email:', error);
      // Handle error, display error message to user, etc.
    }
  };

  return (
    <div className="shopping-cart">
      <h2 className="cart-heading">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty</p>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item, index) => (
              <li key={index} className="cart-item">
                <div className="item-details">
                  <img src={item.imageUrl} alt={`Item ${index}`} className="item-image" />
                  <div>
                    <p className="item-name">{item.caption}</p>
                    <p className="item-price">${item.price}</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(index)} className="remove-button">Remove</button>
              </li>
            ))}
          </ul>
          <div className="checkout-details">
            <p className="total-price">Total Price: ${totalPrice.toFixed(2)}</p>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="input-field" />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="input-field" />
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="input-field" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="input-field" />
            <button onClick={handleCheckout} className="checkout-button">Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
