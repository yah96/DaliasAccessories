import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../firebase';
import { ref, deleteObject } from 'firebase/storage';
import { collection, query, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import '../css/ViewUploadedPictures.css';

const ViewUploadedPictures = () => {
    const [pictures, setPictures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
          try {
            const categories = ['Woman', 'Kids', 'Man', 'Nail', 'Makeup'];
            const imagesData = [];
      
            for (const category of categories) {
              let subcategories = [];
              if (category !== 'Nail' && category !== 'Makeup') {
                subcategories = await fetchSubcategories(category);
              } else {
                // For Nail and Makeup categories without subcategories
                subcategories = ["generatedID123"];
              }
              
              for (const subcategory of subcategories) {
                const imagesCollectionRef = collection(firestore, 'images', category, subcategory);
                const q = query(imagesCollectionRef);
                const snapshot = await getDocs(q);
      
                const imageData = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  imageUrl: doc.data().imageUrl,
                  caption: doc.data().caption || 'No caption',
                  mainCategory: category,
                  subCategory: subcategory,
                }));
                imagesData.push(...imageData);
              }
            }
            setPictures(imagesData);
            setLoading(false); // Set loading to false after images are fetched
          } catch (error) {
            console.error('Error fetching images', error);
            setLoading(false); // Set loading to false in case of error
          }
        };
        fetchImages();
      }, []);

    const fetchSubcategories = async (mainCategory) => {
        try {
            const categoriesCollectionRef = collection(firestore, 'categories');
            const docRef = doc(categoriesCollectionRef, mainCategory);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                return Object.keys(data).filter(key => key !== 'topImageUrl');
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching subcategories', error);
            return [];
        }
    };

    const handleDelete = async (id, mainCategory, subCategory, imageUrl) => {
        // Confirm deletion
        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (!confirmDelete) return;
    
        try {
            // Delete the image document from Firestore
            await deleteDoc(doc(firestore, 'images', mainCategory, subCategory, id));
    
            // Extract filename from imageUrl
            const name = imageUrl.split('%2F')[1].split('?')[0].replace(/%20/g, ' ');
    
            // Create storage reference
            const storageRef = ref(storage, `images/${name}`);
    
            // Delete the image file
            await deleteObject(storageRef);
    
            // Update the state to remove the deleted image
            setPictures(pictures.filter((picture) => picture.id !== id));
        } catch (error) {
            console.error('Error deleting image', error);
        }
    };    
    

    return (
        <div className="uploaded-image-container">
            {loading ? (
                <p>Loading...</p>
            ) : (
                pictures.map((picture) => (
                    <div key={picture.id} className="uploaded-image-item">
                        <img src={picture.imageUrl} alt={picture.caption} />
                        <p>{picture.caption}</p>
                        <button onClick={() => handleDelete(picture.id, picture.mainCategory, picture.subCategory, picture.imageUrl)}>Delete</button>
                    </div>
                ))
            )}
        </div>
    );
};

export default ViewUploadedPictures;
