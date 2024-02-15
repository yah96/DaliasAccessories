import React, { useState } from 'react';
import { collection, query, where, getDocs } from '../firebase'; // Adjust the import path based on your project structure
import { firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
  
      try {
        // Check if the provided username exists in the 'users' collection
        const usersCollection = collection(firestore, 'user');
        const userQuery = query(usersCollection, where('username', '==', username));
        const userSnapshot = await getDocs(userQuery);
  
        if (userSnapshot.empty) {
          setError('User not found');
          return;
        }
  
        // User found, check the password (this is a simplified example, you should hash and compare securely)
        const userData = userSnapshot.docs[0].data();
        if (userData.password !== password) {
          setError('Invalid password');
          return;
        }
  
        // Username and password are correct, set the user state
        setUser(userData);
  
        // Perform navigation to 'upload-images'
        navigate('/upload-images');
      } catch (error) {
        setError('Error during login');
        console.error(error);
      }
    };

  return (
    <div className="text-center">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="mt-4">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            User Name
          </label>
          <input
            type="text "
            id="username"
            className="form-control"
            placeholder="Enter your User name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
