import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../firebase';
import "../css/WallPaper.css"
const Wallpaper = () => {
  const [wallpaper, setWallpaper] = useState(null);

  useEffect(() => {
    const fetchLatestWallpaper = async () => {
      const wallpapersCollection = collection(firestore, 'wallpapers');
      const latestWallpapersQuery = query(wallpapersCollection, orderBy('timestamp', 'desc'), limit(1));
      const wallpapersSnapshot = await getDocs(latestWallpapersQuery);

      if (!wallpapersSnapshot.empty) {
        const latestWallpaperData = wallpapersSnapshot.docs[0].data();
        setWallpaper(latestWallpaperData.imageUrl);
      }
    };

    fetchLatestWallpaper();
  }, []);

  return (
    <div className="wallpaper-container">
      {wallpaper && (
        <img src={wallpaper} alt="Latest Wallpaper" className="wallpaper-image" />
      )}
    </div>
  );
};

export default Wallpaper;
