import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Link } from 'react-router-dom';
import Wallpaper from './WallPaper';
import DeliveryInfo from './DeliveryInfo';
import Footer from './Footer';
import '../css/LoadImages.css';

const LoadImages = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(firestore, 'categories');
      const categoriesSnapshot = await getDocs(categoriesCollection);

      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCategories(categoriesData);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const getRandomSubcategory = (category) => {
    if (category?.topImageUrl) {
      return null;
    }
    const subcategories = Object.keys(category).filter(
      (key) => key !== 'id' && key !== 'name' && key !== 'description'
    );

    if (subcategories.length === 0) {
      return null;
    }

    const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    return randomSubcategory;
  };

  return (
    <div>
      <Wallpaper />
      <DeliveryInfo />
    <div className="shop-container">
      
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <>
          <div className="category-row">
            {categories.length === 0 ? (
              <p>No categories available. Add some categories!</p>
            ) : (
              categories.map((category) => {
                const randomSubcategory = getRandomSubcategory(category);
                const topImageUrl = randomSubcategory
                  ? category[randomSubcategory].topImageUrl
                  : category.topImageUrl || 'default_image_url';

                return (
                  <Link key={category.id} to={`/category/${category.id}`} className="category-link">
                    <div className="category-container">
                      <h2 className="category-title">{category.id}</h2>
                      {topImageUrl && (
                        <img
                          src={topImageUrl}
                          alt={` ${category.id}`}
                          className="category-image"
                        />
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
    <Footer />
    </div>
  );
};

export default LoadImages;