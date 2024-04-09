import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore, collection, query, getDocs } from '../firebase';
import '../css/DynamicImageDisplay.css';

const DynamicImageDisplay = ({ updateCartItemsCount }) => {
  const { mainCategory, subCategory } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDotImages, setSelectedDotImages] = useState([]); // Array to track selected dot index for each item
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
          imageId : doc.id,
          imageUrls: doc.data().imageUrl || [], // Store array of image URLs
          caption: doc.data().caption || 'No caption',
          price: doc.data().price ? `${doc.data().price}` : 'No price available', // Add dollar sign to price
          stock: doc.data().stock || 0, // Default stock to 0 if not available
          details: doc.data().details || '',
        }));
        setImages(imageData);
        // Initialize selectedDotImages array with default values
        setSelectedDotImages(new Array(imageData.length).fill(0));
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
  const addToShoppingCart = (imageId,imageUrl, caption, price, stock, index) => {
    // Check if item is available
    if (stock > 0) {
      // Retrieve existing shopping cart items from localStorage
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      // Create a new item object with additional information (mainCategory and subCategory)
      const newItem = {
        imageId,
        imageUrl,
        caption,
        price,
        stock,
        mainCategory,
        subCategory
      };
      // Add the new item to the shopping cart
      const updatedCartItems = [...existingCartItems, newItem];
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

  const handleImageClick = (index) => {
    setSelectedMainImageIndex(index);
    setSelectedImageIndex(selectedDotImages[index]);
    setShowModal(true);
    setClickedIndex(index); // Set clicked index for adding to cart
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setClickedIndex(null); // Reset clicked index when modal is closed
  };

  // Function to handle next image
  const nextImage = (currentIndex) => {
    if (images[currentIndex] && images[currentIndex].imageUrls) {
      setSelectedImageIndex((prevIndex) => (prevIndex === images[currentIndex].imageUrls.length - 1 ? 0 : prevIndex + 1));
    }
  };

  // Function to handle previous image
  const prevImage = (currentIndex) => {
    if (images[currentIndex] && images[currentIndex].imageUrls) {
      setSelectedImageIndex((prevIndex) => (prevIndex === 0 ? images[currentIndex].imageUrls.length - 1 : prevIndex - 1));
    }
  };

  // Function to handle dot click
  const handleDotClick = (index, itemIndex) => {
    setSelectedDotImages((prevDotImages) => {
      const updatedDotImages = [...prevDotImages];
      updatedDotImages[itemIndex] = index;
      return updatedDotImages;
    });
  };
  const renderDotNavigation = (itemIndex) => {
    const { imageUrls } = images[itemIndex];
    if (Array.isArray(imageUrls) && imageUrls.length > 1) {
      return (
        <div className="dots">
          {imageUrls.map((url, i) => (
            <span
              key={i}
              className={i === selectedMainImageIndex ? 'dot active' : 'dot'}
              onClick={() => setSelectedMainImageIndex(i)}
            ></span>
          ))}
        </div>
      );
    }
    return null; // No dots if only one image or no image array
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
          {images.map((item, itemIndex) => (
            <div key={itemIndex} className="dynamic-image-item">
              <div className="image-container">
                {/* Render single image if imageUrl is a string */}
                {typeof item.imageUrls === 'string' || item.imageUrls.length === 1 ? (
                  <img src={item.imageUrls} alt={`${itemIndex}-${selectedImageIndex}`} onClick={() => handleImageClick(itemIndex)} />
                ) : (
                  <>
                    {/* Render image based on selected dot index */}
                    <img src={item.imageUrls[selectedDotImages[itemIndex]]} alt={`${itemIndex}-${selectedImageIndex}`} onClick={() => handleImageClick(itemIndex)} />
                    {/* Render dots for multiple images */}
                    <div className="dots">
                      {item.imageUrls.map((url, i) => (
                        <span key={i} className={i === selectedDotImages[itemIndex] ? "dot active" : "dot"} onClick={() => handleDotClick(i, itemIndex)}></span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="dynamic-image-details">
                <p className="caption">{item.caption}</p>
                <p className="details">{item.details}</p>
                <p className="price">${item.price}</p>
              </div>
              {/* Button to add item to shopping cart or "Added to Cart" text */}
              {clickedIndex === itemIndex && !showModal ? (
                  <span>Added to Cart</span>
                ) : item.stock > 0 ? (
                  <button className="add-to-cart-button" onClick={() => addToShoppingCart(item.imageId,item.imageUrls, item.caption, item.price, item.stock, itemIndex)}>Add to Shopping Cart</button>
                ) : (
                  <button className="out-of-stock-button" disabled>Out of Stock</button>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Modal to display the selected image */}
      {showModal && (
        <div className="dynamic-modal" onClick={closeModal}>
          {Array.isArray(images[selectedMainImageIndex].imageUrls) ? ( // Check if the item has multiple images
            <img src={images[selectedMainImageIndex].imageUrls[selectedImageIndex]} alt="Selected " className="dynamic-modal-image" />
          ) : (
            <img src={images[selectedMainImageIndex].imageUrls} alt="Selected " className="dynamic-modal-image" /> // Display the single image
          )}
          <div className="modal-btns-container">
            <button className="modal-btn prev-btn" onClick={(e) => { e.stopPropagation(); prevImage(selectedMainImageIndex); }}>
              <span className="btn-label">Previous</span>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="modal-btn next-btn" onClick={(e) => { e.stopPropagation(); nextImage(selectedMainImageIndex); }}>
              <span className="btn-label">Next</span>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DynamicImageDisplay;
