import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../firebase';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, getDocs, getDoc, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import EditModal from './EditModal';
import '../css/ViewUploadedPictures.css';

const ViewUploadedPictures = () => {
    const [pictures, setPictures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPicture, setSelectedPicture] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedDotImages, setSelectedDotImages] = useState([]); 
    const [uploading, setUploading] = useState(false); // State to track uploading status

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
                            details: doc.data().details || 'No details',
                            price: doc.data().price || "No price"
                        }));
                        imagesData.push(...imageData);
                    }
                }
                setPictures(imagesData);
                setSelectedDotImages(new Array(imagesData.length).fill(0));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching images', error);
                setLoading(false);
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
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(firestore, 'images', mainCategory, subCategory, id));
            const name = imageUrl.split('%2F')[1].split('?')[0].replace(/%20/g, ' ');
            const storageRef = ref(storage, `images/${name}`);
            await deleteObject(storageRef);
            setPictures(pictures.filter((picture) => picture.id !== id));
        } catch (error) {
            console.error('Error deleting image', error);
        }
    };

    const handleEdit = (id, mainCategory, subCategory, currentCaption, currentPrice, currentDetails) => {
        setSelectedPicture({ id, mainCategory, subCategory, currentCaption, currentPrice, currentDetails });
        setShowModal(true);
    };

    const updateImage = async (id, mainCategory, subCategory, newCaption, newPrice, newDetails) => {
        try {
            const imageRef = doc(firestore, 'images', mainCategory, subCategory, id);
            await updateDoc(imageRef, {
                caption: newCaption,
                price: parseFloat(newPrice),
                details: newDetails
            });
            setPictures(pictures.map(picture => {
                if (picture.id === id) {
                    return {
                        ...picture,
                        caption: newCaption,
                        price: parseFloat(newPrice),
                        details: newDetails
                    };
                }
                return picture;
            }));
        } catch (error) {
            console.error('Error updating image', error);
        }
    };

    const handleDeleteImage = async (id, mainCategory, subCategory, imageUrlIndex, index) => {
        const confirmDelete = window.confirm('Are you sure you want to delete one image?');
        if (!confirmDelete) return;
    
        try {
            const updatedImageUrlArray = [...pictures.find(picture => picture.id === id).imageUrl];
            updatedImageUrlArray.splice(imageUrlIndex, 1);
            await updateDoc(doc(firestore, 'images', mainCategory, subCategory, id), {
                imageUrl: updatedImageUrlArray
            });
            setPictures(pictures.map(picture => {
                if (picture.id === id) {
                    return {
                        ...picture,
                        imageUrl: updatedImageUrlArray
                    };
                }
                return picture;
            }));
    
            setSelectedDotImages(prevDotImages => {
                const updatedDotImages = [...prevDotImages];
                updatedDotImages[index] = updatedDotImages[index] > 0 ? updatedDotImages[index] - 1 : 0; // Ensure the index doesn't go below 0
                return updatedDotImages;
            });
        } catch (error) {
            console.error('Error deleting image', error);
        }
    };
    

    const handleDotClick = (index, itemIndex) => {
        setSelectedDotImages(prevDotImages => {
            const updatedDotImages = [...prevDotImages];
            updatedDotImages[itemIndex] = index;
            return updatedDotImages;
        });
    };

    const handleImageUpload = async (file, mainCategory, subCategory, itemId, index) => {
        // Display a confirmation message to the user
        const confirmUpload = window.confirm('Are you sure you want to upload this picture?');

        // If the user cancels the upload, exit the function
        if (!confirmUpload) return;

        // Set uploading state to true
        setUploading(true);

        // Create a reference to the storage location where the file will be uploaded
        const storageRef = ref(storage, `images/${file.name}`);

        try {
            // Upload the file to Firebase Storage
            await uploadBytes(storageRef, file);

            // Get the download URL of the uploaded file
            const imageUrl = await getDownloadURL(storageRef);

            // Update the Firestore document with the new image URL
            const imageRef = doc(firestore, 'images', mainCategory, subCategory, itemId);
            await updateDoc(imageRef, {
                imageUrl: arrayUnion(imageUrl)
            });

            // Update the local state with the new image URL
            setPictures(prevPictures => {
                return prevPictures.map((picture, idx) => {
                    if (idx === index) {
                        return {
                            ...picture,
                            imageUrl: [...picture.imageUrl, imageUrl]
                        };
                    }
                    return picture;
                });
            });

            setSelectedDotImages(prevDotImages => {
                const updatedDotImages = [...prevDotImages];
                updatedDotImages[index] = updatedDotImages[index] + 1; // Increment the count of images
                return updatedDotImages;
            });

        } catch (error) {
            console.error('Error uploading image', error);
        } finally {
            // Set uploading state back to false after upload completes or fails
            setUploading(false);
        }
    };


    return (
        <div className="uploaded-image-container">
        {loading ? (
            <p>Loading...</p>
        ) : (
            <>
                {pictures.map((picture, index) => (
                    <div key={picture.id} className="uploaded-image-item">
                        {/* Display single image if imageUrl is a string */}
                        {typeof picture.imageUrl === 'string' && (
                            <div>
                                <img src={picture.imageUrl} alt={picture.caption} className="uploaded-image" />
                                <div className="uploaded-image-button-container">
                                    <button className="delete-button" onClick={() => handleDeleteImage(picture.id, picture.mainCategory, picture.subCategory, 0, index)}>x</button>
                                    <label htmlFor={`upload-${picture.id}`} className="upload-icon" title="Upload Picture">+</label>
                                    {/* Show "adding..." label during uploading */}
                                    {uploading && (
                                        <label className="uploading-label">Adding...</label>
                                    )}
                                    <input type="file" id={`upload-${picture.id}`} className="file-input-container" onChange={(e) => handleImageUpload(e.target.files[0], picture.mainCategory, picture.subCategory, picture.id, index)} />
                                </div>
                            </div>
                        )}

                        {/* Display multiple images if imageUrl is an array */}
                        {Array.isArray(picture.imageUrl) && (
                            picture.imageUrl.map((url, i) => (
                                <div key={i} style={{ display: i === selectedDotImages[index] ? 'block' : 'none' }}>
                                    <img src={url} alt={picture.caption} className="uploaded-image" />
                                    <div className="uploaded-image-button-container">
                                        <button className="delete-button" onClick={() => handleDeleteImage(picture.id, picture.mainCategory, picture.subCategory, i, index)}>x</button>
                                        <label htmlFor={`upload-${picture.id}`} className="upload-icon" title="Upload Picture">+</label>
                                        {/* Show "adding..." label during uploading */}
                                        {uploading && (
                                            <label className="uploading-label">Adding...</label>
                                        )}
                                        <input type="file" id={`upload-${picture.id}`} className="file-input-container" onChange={(e) => handleImageUpload(e.target.files[0], picture.mainCategory, picture.subCategory, picture.id, index)} />
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="pagination-dots">
                            {/* Render pagination dots only if there are multiple images */}
                            {Array.isArray(picture.imageUrl) && picture.imageUrl.length > 1 && (
                                picture.imageUrl.map((url, i) => (
                                    <span key={i} className={i === selectedDotImages[index] ? "dot active" : "dot"} onClick={() => handleDotClick(i, index)}></span>
                                ))
                            )}
                        </div>

                        <div>
                            <p className="image-caption">{picture.caption}</p>
                        </div>
                        <div className="uploaded-image-button-container">
                            <button className="edit-button" onClick={() => handleEdit(picture.id, picture.mainCategory, picture.subCategory, picture.caption, picture.price, picture.details)}>Edit</button>
                            <button className="delete-button" onClick={() => handleDelete(picture.id, picture.mainCategory, picture.subCategory, picture.imageUrl)}>Delete</button>
                        </div>
                    </div>
                ))}
            </>
        )}

        {showModal && selectedPicture && (
            <div className="modal-wrapper">
                <EditModal
                    id={selectedPicture.id}
                    mainCategory={selectedPicture.mainCategory}
                    subCategory={selectedPicture.subCategory}
                    currentCaption={selectedPicture.currentCaption}
                    currentPrice={selectedPicture.currentPrice}
                    currentDetails={selectedPicture.currentDetails}
                    handleEdit={updateImage}
                    setShowModal={setShowModal}
                />
            </div>
        )}
    </div>
);
};

export default ViewUploadedPictures;
