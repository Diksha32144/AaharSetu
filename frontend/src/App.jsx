import React, { useEffect, useState } from 'react';
import { Utensils, MapPin, User, Phone, HeartHandshake } from 'lucide-react';
import FoodMap from './components/FoodMap';

export default function App() {
  const [foodPosts, setFoodPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch available food posts from your backend
  useEffect(() => {
    fetch('http://localhost:5000/api/food')
      .then((res) => res.json())
      .then((data) => setFoodPosts(data))
      .catch((err) => console.error('Error fetching food posts:', err));
  }, []);

  return (
    <div className="app-container">
      {/* Pastel Header */}
      <header className="navbar">
        <div className="icon-row">
          <HeartHandshake size={32} className="icon-mint" />
          <div>
            <h1 className="brand-title">AaharSetu</h1>
            <p className="brand-subtitle">Connecting surplus food with people nearby</p>
          </div>
        </div>

        <span className="badge-count icon-row">
          <Utensils size={16} />
          {foodPosts.length} Available Meals
        </span>
      </header>

      {/* Interactive Map */}
      <FoodMap
        foodPosts={foodPosts}
        selectedPost={selectedPost}
        onSelectPost={setSelectedPost}
      />

      {/* Interactive Food Cards */}
      <h2 className="section-heading">
        Available Donations (Click a card to locate on map)
      </h2>

      <div className="food-grid">
        {foodPosts.map((post) => (
          <div
            key={post.id}
            className={`food-card ${selectedPost?.id === post.id ? 'selected' : ''}`}
            onClick={() => setSelectedPost(post)}
          >
            <span className="food-tag">{post.quantity}</span>
            <h3>{post.food_title}</h3>

            <p className="icon-row">
              <MapPin size={16} className="icon-peach" />
              <span>{post.address}</span>
            </p>

            <p className="icon-row">
              <User size={16} className="icon-mint" />
              <span>{post.donor_name}</span>
              <Phone size={14} className="icon-mint" />
              <span>{post.donor_phone}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}