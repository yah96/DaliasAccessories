import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore, collection, query, getDocs } from '../firebase';
import '../css/DynamicImageDisplay.css';

const DynamicImageDisplay = ({ updateCartItemsCount }) => {
  const { mainCategory, subCategory } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clickedIndex, setClickedIndex] = useState(null); // Track index of clicked image

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let imagesCollectionRef;
        if (mainCategory === 'Nail' || mainCategory === 'Makeup') {
          imagesCollectionRef = collection(firestore, 'images', mainCategory, 'generatedID123');
        } else {
          imagesCollectionRef = collection(firestore, 'images', mainCategory, subCategory);
        }
        const q = query(imagesCollectionRef);
        const snapshot = await getDocs(q);

        const imageData = snapshot.docs.map((doc) => ({
          imageUrl: doc.data().imageUrl,
          caption: doc.data().caption || 'No caption',
          price: doc.data().price ? `${doc.data().price}` : 'No price available', // Add dollar sign to price
          stock: doc.data().stock || 0, // Default stock to 0 if not available
        }));
        setImages(imageData);
        setLoading(false); // Set loading to false after images are fetched
      } catch (error) {
        console.error('Error fetching images', error);
      }
    };

    if (mainCategory && subCategory) {
      fetchImages();
    }
  }, [mainCategory, subCategory]);

  // Function to add item to shopping cart in localStorage
  const addToShoppingCart = (imageUrl, caption, price, stock, index) => {
    // Check if item is available
    if (stock > 0) {
      // Retrieve existing shopping cart items from localStorage
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      // Add the new item to the shopping cart
      const updatedCartItems = [...existingCartItems, { imageUrl, caption, price }];
      // Store the updated shopping cart items in localStorage
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      // Set notification message

      // Set clicked index to display "Added to Cart" text
      setClickedIndex(index);

      // Clear notification and reset clicked index after 2 seconds
      setTimeout(() => {
        setClickedIndex(null);
      }, 2000);

      updateCartItemsCount();
    } else {
      window.alert('This item is currently out of stock.');
    }
  };

  // Function to handle image click and show modal
  const handleImageClick = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
    setClickedIndex(index); // Set clicked index for adding to cart
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setClickedIndex(null); // Reset clicked index when modal is closed
  };

  return (
    <div className="dynamic-image-display">
      <h2>{`${mainCategory} - ${subCategory}`}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : images.length === 0 ? ( // Display message when no images are found
        <p>No items found.</p>
      ) : (
        <div className="dynamic-image-list">
          {images.map((image, index) => (
            <div key={index} className="dynamic-image-item">
              <img src={image.imageUrl} alt={` ${index}`} onClick={() => handleImageClick(image.imageUrl, index)} />
              <div className="dynamic-image-details">
                <p className="caption">{image.caption}</p>
                <p className="price">${image.price}</p>
              </div>
              {/* Button to add item to shopping cart or "Added to Cart" text */}
              {clickedIndex === index ? (
                <span>Added to Cart</span>
              ) : (
                <button onClick={() => addToShoppingCart(image.imageUrl, image.caption, image.price, image.stock, index)}>Add to Shopping Cart</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal to display the selected image */}
      {showModal && (
        <div className="dynamic-modal" onClick={closeModal}>
          <img src={selectedImage} alt="Selected " className="dynamic-modal-image" />
        </div>
      )}
    </div>
  );
};

export default DynamicImageDisplay;
