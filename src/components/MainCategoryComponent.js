import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestore, collection, getDocs } from '../firebase';
import '../css/MainCategoryComponent.css'; // Import CSS file
import { FaSpinner } from 'react-icons/fa'; // Import the spinner icon

const MainCategoryComponent = () => {
  const { mainCategory } = useParams();
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [imagesBySubcategory, setImagesBySubcategory] = useState({});
  const [loading, setLoading] = useState(true); // State variable for loading
  const navigate = useNavigate();

  const subcategories = {
    Woman: ['Earrings', 'Necklace', 'Ring', 'Bracelet', 'Anklet', 'Hair accessories'],
    Kids: ['Earrings', 'Bracelet', 'Hair accessories'],
    Man: ['Bracelet', 'Necklace'],
    Nail: [],
    Makeup: [], 
  };

  useEffect(() => {
    const fetchImages = async () => {
      let imagesObj = {};
  
      // Check if the mainCategory is "Nail" or "Makeup"
      if (mainCategory === 'Nail' || mainCategory === 'Makeup') {
        try {
          // Fetch images directly for Nail and Makeup categories without subcategories
          const imagesCollectionRef = collection(firestore, 'images', mainCategory, 'generatedID123');
          const snapshot = await getDocs(imagesCollectionRef);
  
          const imageData = snapshot.docs.map((doc) => doc.data().imageUrl);
          imagesObj[mainCategory] = imageData;
        } catch (error) {
          console.error('Error fetching images for category', mainCategory, error);
        }
      } else {
        // For other categories with subcategories
        const subcategoryList = subcategories[mainCategory];
        if (subcategoryList) {
          for (const subcategory of subcategoryList) {
            try {
              const imagesCollectionRef = collection(firestore, 'images', mainCategory, subcategory);
              const snapshot = await getDocs(imagesCollectionRef);
  
              const imageData = snapshot.docs.map((doc) => doc.data().imageUrl);

              imagesObj[subcategory] = imageData;
            } catch (error) {
              console.error('Error fetching images for subcategory', subcategory, error);
            }
          }
        }
      }
  
      setImagesBySubcategory(imagesObj);
      setSubcategoriesList(mainCategory === 'Nail' || mainCategory === 'Makeup' ? [mainCategory] : Object.keys(imagesObj));
      setLoading(false); // Set loading to false after images are fetched
    };
  
    fetchImages();
  }, [mainCategory]);
  
  const handleImageClick = (subcategory) => {
    navigate(`/category/${mainCategory}/${subcategory}`);
  };

  return (
    <div>
      <h2 className="main-category-title">{mainCategory}</h2>
      <div className="subcategory-container">
        {subcategoriesList.map((subcategory, index) => (
          <div key={index} className="subcategory-item">
            <h3>{subcategory}</h3>
            <div className="image-list">
              {loading ? ( // Display spinner while loading
                <div className="loading-spinner">
                  <FaSpinner className="spinner-icon" />
                </div>
              ) : (
                imagesBySubcategory[subcategory] && imagesBySubcategory[subcategory].length > 0 ? (
                  imagesBySubcategory[subcategory].map((imageUrl, imgIndex) => (
                    <img 
                      key={imgIndex} 
                      src={imageUrl} 
                      alt={` ${imgIndex}`} 
                      onClick={() => handleImageClick(subcategory)} 
                      title="Click to view subcategory"
                    />
                  ))
                ) : (
                  <p>Currently no items are available</p>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainCategoryComponent;
