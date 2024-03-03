import React, { useState } from 'react';
import '../css/EditModal.css'; // Import your CSS file for styling

const EditModal = ({ id, mainCategory, subCategory, currentCaption, currentPrice, currentDetails, handleEdit, setShowModal }) => {
  const [newCaption, setNewCaption] = useState(currentCaption);
  const [newPrice, setNewPrice] = useState(currentPrice);
  const [newDetails, setNewDetails] = useState(currentDetails);

  const handleSubmit = () => {
    // Call handleEdit function to update the data
    handleEdit(id, mainCategory, subCategory, newCaption, newPrice, newDetails);

    // Close the modal
    setShowModal(false);
  };

  const handleClose = () => {
    // Close the modal without saving changes
    setShowModal(false);
  };

  return (
    <div className="edit-modal">
      <h2>Edit Image</h2>
      <div className="form-group">
        <label htmlFor="caption">Caption:</label>
        <input
          type="text"
          id="caption"
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="price">Price:</label>
        <input
          type="text"
          id="price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="details">Details:</label>
        <textarea
          id="details"
          value={newDetails}
          onChange={(e) => setNewDetails(e.target.value)}
        />
      </div>
      <div className="buttons">
        <button className="btn-save" onClick={handleSubmit}>Save Changes</button>
        <button className="btn-close" onClick={handleClose}></button>
      </div>
    </div>
  );
};

export default EditModal;
