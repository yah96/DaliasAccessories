import React, { useState } from 'react';
import { storage, firestore } from '../firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL, deleteObject 
} from 'firebase/storage';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../css/imageUpload.css';

const ImageUpload = () => {
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [details,setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    if (e.target.files) {
      setImages([...e.target.files]);
    }
  };

  const handleUpload = async () => {
    try {
      if (!images || images.length === 0) {
        setError('Please select at least one image before uploading.');
        return;
      }
  
      if (!mainCategory) {
        setError('Please select at least the main category.');
        return;
      }
  
      const imageURLs = [];
  
      for (const image of images) {
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
  
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            (error) => {
              console.error(error);
              reject(error);
            },
            async () => {
              setProgress(0);
  
              const url = await getDownloadURL(storageRef);
              imageURLs.push(url);
  
              resolve(url);
            }
          );
        });
      }
  
      if (mainCategory === 'Wallpaper') {
        await deleteWallpaperAndImage();
        const wallpaperDocRef = await addDoc(collection(firestore, 'wallpapers'), {
          timestamp: serverTimestamp(),
          imageUrl: imageURLs,
        });
  
        window.alert('Wallpaper added successfully!');
      } else {
        const subcategoryDocumentId = subCategory || generateUniqueID();
  
        const imageDocRef = doc(collection(firestore, 'images', mainCategory, subcategoryDocumentId));
  
        const imageDocSnapshot = await getDoc(imageDocRef);
  
        if (imageDocSnapshot.exists()) {
          await updateDoc(imageDocRef, {
            caption: caption,
            details: details,
            imageUrl: imageURLs,
            price: parseFloat(price), // Convert price to number
            stock: parseInt(stock), // Convert stock to number
          });
        } else {
          await setDoc(imageDocRef, {
            caption: caption,
            details: details,
            imageUrl: imageURLs,
            price: parseFloat(price), // Convert price to number
            stock: parseInt(stock), // Convert stock to number
          });
        }
  
        const categoriesCollection = collection(firestore, 'categories');
        const categoryDocRef = doc(categoriesCollection, mainCategory);
        const categoryDocSnapshot = await getDoc(categoryDocRef);
  
        if (categoryDocSnapshot.exists()) {
          const categoryData = categoryDocSnapshot.data();
  
          if (subCategory) {
            if (categoryData[subCategory]) {
              await updateDoc(categoryDocRef, {
                [subCategory]: {
                  topImageUrl: imageURLs[0], // Update only the first image URL as topImageUrl
                  lastUpdated: serverTimestamp(),
                },
              });
            } else {
              await updateDoc(categoryDocRef, {
                [subCategory]: {
                  name: mainCategory,
                  description: subCategory,
                  topImageUrl: imageURLs[0], // Update only the first image URL as topImageUrl
                  lastUpdated: serverTimestamp(),
                },
              });
            }
          } else {
            await updateDoc(categoryDocRef, {
              topImageUrl: imageURLs[0], // Update only the first image URL as topImageUrl
              lastUpdated: serverTimestamp(),
            });
          }
        } else {
          await setDoc(categoryDocRef, {
            topImageUrl: imageURLs[0], // Update only the first image URL as topImageUrl
            lastUpdated: serverTimestamp(),
          });
        }
  
        window.alert('Upload successful!');
      }
  
      // Reset state and display success message
      setCaption('');
      setDetails('');
      setPrice('');
      setStock('');
      setImages([]);
      setMainCategory('');
      setSubCategory('');
      setError(null);
      setUploading(false);
      setUploadComplete(true);
  
      window.alert('All images uploaded successfully!');
    } catch (error) {
      console.error(error.message);
      setError(error.message);
      setUploading(false);
      window.alert('Upload failed. Please try again.');
    }
  };
  


  function generateUniqueID() {
    return 'generatedID123';
  }
  const deleteWallpaperAndImage = async () => {
    try {
      // Fetch wallpaper documents from Firestore collection
      const wallpapersCollectionRef = collection(firestore, 'wallpapers');
      const wallpapersSnapshot = await getDocs(wallpapersCollectionRef);
      
      // Iterate over each wallpaper document
      wallpapersSnapshot.forEach(async (wallpaperDoc) => { // Rename 'doc' to 'wallpaperDoc'
        const wallpaperData = wallpaperDoc.data();
        
        // Delete the wallpaper document from Firestore
        await deleteDoc(doc(firestore, 'wallpapers', wallpaperDoc.id));
        
        // Delete the corresponding image from Firebase Storage
        const imageUrl = wallpaperData.imageUrl;
        // Extract filename from imageUrl
        const name = imageUrl.split('%2F')[1].split('?')[0].replace(/%20/g, ' ');
  
        // Create storage reference
        const storageRef = ref(storage, `images/${name}`);
  
        // Delete the image file
        await deleteObject(storageRef);
        
        console.log(`Wallpaper "${wallpaperDoc.id}" and corresponding image deleted successfully.`);
      });
    } catch (error) {
      console.error('Error deleting wallpaper and image', error);
    }
  };

  return (
    <div className="image-upload-container clearfix">
      <h2>Image Upload</h2>
      <input type="file" onChange={handleChange} multiple className="input-file" />
      <input
        type="text"
        placeholder="Enter a caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="input-caption"
      />
      <input
        type="text"
        placeholder="Enter Details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        className="input-caption"
      />
      <input
        type="number"
        placeholder="Enter price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="input-price"
      />
      <input
        type="number"
        placeholder="Enter stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="input-stock"
      />
      <div className="category-dropdowns">
        <select
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
          className="select-category"
        >
          <option value="" disabled>
            Select a main category
          </option>
          <option value="Wallpaper">Wallpaper</option>
          <option value="Woman">Woman</option>
          <option value="Kids">Kids</option>
          <option value="Man">Man</option>
          <option value="Makeup">Makeup</option>
          <option value="Nail">Nail</option>
        </select>
        <select
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="select-category"
        >
          <option value="" disabled>
            Select a sub category
          </option>
          {mainCategory === 'Woman' && (
            <>
              <option value="Earrings">Earrings</option>
              <option value="Necklace">Necklace</option>
              <option value="Ring">Ring</option>
              <option value="Bracelet">Bracelet</option>
              <option value="Anklet">Anklet</option>
              <option value="Hair accessories">Hair accessories</option>
            </>
          )}
          {mainCategory === 'Kids' && (
            <>
              <option value="Earrings">Earrings</option>
              <option value="Bracelet">Bracelet</option>
              <option value="Hair accessories">Hair accessories</option>
            </>
          )}
          {mainCategory === 'Man' && (
            <>
              <option value="Bracelet">Bracelet</option>
              <option value="Necklace">Necklace</option>
            </>
          )}
          {mainCategory === 'Nail'}
          {mainCategory === 'MakeUp'}
        </select>
      </div>
      <button onClick={handleUpload} className="upload-button" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className="error-message" error={error}>{error}</p>}
      {progress > 0 && <progress value={progress} max="100" className="progress-bar" />}
      {uploadComplete && <p className="success-message">Upload successful!</p>}
      <Link to="/view-uploaded-pictures">View Uploaded Pictures</Link>
    </div>
    
  );
};

export default ImageUpload;
