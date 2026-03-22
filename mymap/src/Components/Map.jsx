import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import AddReviews from "./AddReviews";
import AdminReviewer from "./AdminReviewer";

const initialLocations = [
  { lat: 28.6139, lng: 77.2090, message: "New Delhi - Capital of India", reviews: [] },
  { lat: 19.0760, lng: 72.8777, message: "Mumbai - Financial Capital", reviews: [] },
  { lat: 12.9716, lng: 77.5946, message: "Bangalore - Tech Hub", reviews: [] }
];

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [screenPoints, setScreenPoints] = useState([]);
  const [locations, setLocations] = useState(initialLocations);
  const mapboxToken = 'pk.eyJ1IjoiYW5raXRrdW1hcjMtMTQiLCJhIjoiY21uMTZoNTZvMHIwdDMyczJpaXN4eTc0ciJ9.O8D49x-_OEgn1Sddj7t38A';

  useEffect(() => {
    try {
      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [77.5946, 12.9716],
        zoom: 10
      });

      mapRef.current = map;

      map.on('load', () => {
        try {
          locations.forEach((loc) => {
            debugger;
            loc.isReviewVerifed && new mapboxgl.Marker()
              .setLngLat([loc.lng, loc.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`<b>${loc.message}</b><br/>Lat: ${loc.lat}, Lng: ${loc.lng}`)
              )
              .addTo(map);
          });

          const point = map.project([77.5946, 12.9716]);
          console.log('Screen point for [77.5946, 12.9716]:', point);

          const projectedPoints = locations.map((loc) => {
            const screenPoint = map.project([loc.lng, loc.lat]);
            return {
              location: loc.message,
              lat: loc.lat,
              lng: loc.lng,
              screenX: screenPoint.x,
              screenY: screenPoint.y
            };
          });

          setScreenPoints(projectedPoints);
        } catch (error) {
          console.error('Error in map load handler:', error);
        }
      });

      map.on('move', () => {
        try {
          const updatedPoints = locations.map((loc) => {
            const screenPoint = map.project([loc.lng, loc.lat]);
            return {
              location: loc.message,
              lat: loc.lat,
              lng: loc.lng,
              screenX: screenPoint.x,
              screenY: screenPoint.y
            };
          });
          setScreenPoints(updatedPoints);
        } catch (error) {
          console.error('Error updating screen points:', error);
        }
      });

      return () => {
        if (map) {
          map.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [locations]);

  const handleVerifyReview = (reviewToVerify) => {
    try {
      if (!reviewToVerify) return;

      const updatedLocations = locations.map((loc) => {
        if (
          loc.lat === reviewToVerify.lat &&
          loc.lng === reviewToVerify.lng &&
          loc.timestamp === reviewToVerify.timestamp
        ) {
          return { ...loc, isReviewVerifed: true };
        }
        return loc;
      });

      setLocations(updatedLocations);
      console.log('Review verified:', reviewToVerify);
    } catch (error) {
      console.error('Error verifying review:', error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" , gap: "20px" }}>
      <h2 style={{ textAlign: "center" }}>India Reviews Map - Get Best Reviews</h2>
      
      <div 
        ref={mapContainerRef} 
        style={{ height: "500px", width: "100%" }}
      />

      <AddReviews 
        locations={locations}
        mapboxToken={mapboxToken}
        onAddReview={(review) => {
          try {
            if (review && review.locationIndex !== undefined) {
              const updatedLocations = [...locations];
              updatedLocations.push({
                message: review.placeName +" - "+ review.address + " - " + review.text,
                reviewText: review.text,
                rating: review.rating,
                timestamp: review.timestamp,
                lat: review.locationIndex.lat,
                lng: review.locationIndex.lng,
                address: review.address,
                placeName: review.placeName,
                isReviewVerifed: false
              });
              setLocations(updatedLocations);
              console.log('Updated locations:', updatedLocations);
            }
          } catch (error) {
            console.error('Error adding review to location:', error);
          }
        }}
      />

      <AdminReviewer 
        locations={locations}
        onVerifyReview={handleVerifyReview}
      />

      <div style={{ padding: "20px", backgroundColor: "#fff", marginTop: "10px", width: "100%" }}>
        <h3>Location Reviews:</h3>
        {locations && locations.length > 0 ? (
          locations.map((loc, index) => (
            <>
            {loc.isReviewVerifed && (
            <div key={index} style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>{loc.message}</h4>
              {loc.address && (
                <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#666" }}>
                  <strong>Address:</strong> {loc.address}
                </p>
              )}
              {loc.reviewText && (
                <p style={{ margin: "5px 0", fontSize: "0.95em" }}>
                  <strong>Review:</strong> {loc.reviewText}
                </p>
              )}
              {loc.rating !== undefined && loc.rating > 0 && (
                <p style={{ margin: "5px 0", fontSize: "0.9em" }}>
                  <strong>Rating:</strong> {'⭐'.repeat(loc.rating)}
                </p>
              )}
              <p style={{ margin: "5px 0", fontSize: "0.85em", color: "#999" }}>
                <strong>Coordinates:</strong> Lat: {loc.lat?.toFixed(4)}, Lng: {loc.lng?.toFixed(4)}
              </p>
              {loc.timestamp && (
                <p style={{ margin: "5px 0", fontSize: "0.85em", color: "#999" }}>
                  <strong>Date:</strong> {new Date(loc.timestamp).toLocaleString()}
                </p>
              )}
            </div>
            )}
            </>
          ))
        ) : (
          <p>No Reviews available</p>
        )}
      </div>
    </div>
  );
}

export default MapComponent;