import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBars } from 'react-icons/fa'; // Import the shopping cart and bars icons
import '../css/Header.css';

const Header = ({cartItemsCount}) => {
  const mainCategories = ['Woman', 'Kids', 'Man', 'Nail', 'Makeup'];

  const subcategories = {
    Woman: ['Earrings', 'Necklace', 'Ring', 'Bracelet', 'Anklet', 'Hair accessories'],
    Kids: ['Earrings', 'Bracelet', 'Hair accessories'],
    Man: ['Bracelet', 'Necklace'],
    Nail: [],
    Makeup: [],
  };

  const [cartItems, setCartItems] = useState([]);
  const [showMenu, setShowMenu] = useState(false); // State to toggle menu visibility
  const [hoveredCategory, setHoveredCategory] = useState(null); // State to track hovered category

  useEffect(() => {
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close the menu if the click is outside of the menu and the menu button
      if (showMenu && !event.target.closest('.header-categories') && !event.target.closest('.Menu-button')) {
        setShowMenu(false);
      }
    };
  
    // Add event listener to handle clicks outside of the menu and menu button
    document.body.addEventListener('click', handleClickOutside);
  
    return () => {
      // Clean up event listener on component unmount
      document.body.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]); // Re-run effect when the showMenu state changes
  

  const handleCategoryHover = (category) => {
    setHoveredCategory(category);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };

  return (
    <header className="shop-header">
      <div className="header-content">
        <h1><Link to="/" className="shop-title">Dalia's Accessories</Link></h1> 
        <nav className={`header-categories ${showMenu ? 'show-menu' : ''}`}>
          <ul>
            {mainCategories.map((mainCategory) => (
              <li key={mainCategory} className="header-category">
                <div
                  onMouseEnter={() => handleCategoryHover(mainCategory)}
                  onMouseLeave={handleCategoryLeave}
                >
                  <Link to={`/category/${mainCategory}`} className="category-link">{mainCategory}</Link>
                  {subcategories[mainCategory] && subcategories[mainCategory].length > 0 && (
                    <div className={`dropdown ${hoveredCategory === mainCategory ? 'show' : ''}`}>
                      {subcategories[mainCategory].map((subcategory) => (
                        <Link key={subcategory} to={`/category/${mainCategory}/${subcategory}`} className="subcategory-link">
                          {subcategory}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/shopping-cart" className="shopping-cart-icon">
          <FaShoppingCart size={24} />
          <span>{cartItemsCount}</span>
        </Link>
        <button className="Menu-button" onClick={toggleMenu} id="leftside">
          <FaBars size={24} />
        </button>
        {showMenu && (
          <nav className="phone">
            <ul>
              {mainCategories.map((mainCategory) => (
                <li key={mainCategory}>
                  <Link to={`/category/${mainCategory}`} className="category-link">{mainCategory}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
