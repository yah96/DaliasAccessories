import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Change: Import HashRouter
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import ImageUpload from './components/ImageUpload';
import Login from './components/Login';
import LoadImages from './components/LoadImages';
import DynamicImageDisplay from './components/DynamicImageDisplay';
import MainCategoryComponent from './components/MainCategoryComponent';
import ShoppingCart from './components/ShoppingCart';
import Header from './components/Header';
import ViewUploadedPictures from './components/ViewUploadedPictures'; 
import './css/App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateCartItemsCount = () => {
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    } else {
      setCartItems(0);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const isRestrictedRoute = () => {
    const restrictedRoutes = ['/admin', '/upload-images','/view-uploaded-pictures'];
    return restrictedRoutes.some(route => window.location.href.includes(route));
  };

  return (
    <Router basename="/"> {/* Change: Use HashRouter and specify basename */}
      <div className="container mt-5">
        {!isRestrictedRoute() && <Header user={user} cartItemsCount={cartItems.length} />}
        <Routes>
          <Route path="/admin" element={<Login setUser={setUser} />} />
          <Route path="/upload-images" element={user ? <ImageUpload /> : <Navigate to="/admin" />} />
          <Route path="/" element={<LoadImages />} /> {/* Change: Removed basename from the root path */}
          <Route path="/category/:mainCategory/:subCategory" element={<DynamicImageDisplay updateCartItemsCount={updateCartItemsCount} />} />
          <Route path="/category/:mainCategory/" element={<MainCategoryComponent />} />
          <Route path="/shopping-cart" element={<ShoppingCart updateCartItemsCount={updateCartItemsCount} />} />
          <Route path="/view-uploaded-pictures" element={<ViewUploadedPictures />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
