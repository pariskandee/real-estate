import React, { useState, useEffect } from 'react';

const Home = ({ lang }) => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // Fetch listings (you can fetch from your backend here)
    setListings([
      { id: 1, title: "House for Sale", price: "€200,000", image: "/images/house1.jpg", type: "T3", location: "Paris" },
      { id: 2, title: "Land for Rent", price: "€1,000/month", image: "/images/land1.jpg", type: "Land", location: "Lyon" },
    ]);
  }, []);

  return (
    <div className="home-page">
      <h1>{lang === "fr" ? "Nos Annonces" : "Our Listings"}</h1>
      <div className="listing-grid">
        {listings.map((listing) => (
          <div key={listing.id} className="listing-card">
            <img src={listing.image} alt={listing.title} />
            <h3>{listing.title}</h3>
            <p>{listing.location}</p>
            <p>{listing.price}</p>
            <p>{listing.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
