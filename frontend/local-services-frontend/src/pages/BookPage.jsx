import React from 'react';
import { useParams } from 'react-router-dom';

const BookPage = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold mb-4">Book Service</h1>
        <p>Booking for provider ID: <b>{id}</b></p>
        <p>(Booking functionality coming soon!)</p>
      </div>
    </div>
  );
};

export default BookPage; 