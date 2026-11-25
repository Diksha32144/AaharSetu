import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet marker icons in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper that smoothly flies the map camera when a card is clicked
function FlyToLocation({ selectedPost }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPost) {
      map.flyTo(
        [parseFloat(selectedPost.latitude), parseFloat(selectedPost.longitude)],
        15,
        { duration: 1.2 }
      );
    }
  }, [selectedPost, map]);

  return null;
}

export default function FoodMap({ foodPosts, selectedPost, onSelectPost }) {
  return (
    <div className="map-card">
      <div className="map-wrapper">
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Soft-toned map tiles matching our pastel theme */}
          <TileLayer
            attribution='© OpenStreetMap contributors © CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <FlyToLocation selectedPost={selectedPost} />

          {foodPosts.map((post) => (
            <Marker
              key={post.id}
              position={[parseFloat(post.latitude), parseFloat(post.longitude)]}
              eventHandlers={{
                click: () => onSelectPost(post),
              }}
            >
              <Popup>
                <strong>{post.food_title}</strong>
                <br />
                Quantity: {post.quantity}
                <br />
                Donor: {post.donor_name} ({post.donor_phone})
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}