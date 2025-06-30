import React, { useState } from 'react';
import { reviewAPI } from '../lib/api';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Star } from 'lucide-react';

export function ReviewForm({ providerId, user, reviews, onReviewSubmit }) {
  // Check if the user has already reviewed
  const hasReviewed = reviews.some(r => r.customerId?._id === user._id);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [justReviewed, setJustReviewed] = useState(false);

  const alreadyReviewed = hasReviewed || justReviewed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setLoading(true);
    try {
      await reviewAPI.createReview({ providerId, rating, comment });
      setSuccess('Review submitted!');
      setRating(0);
      setComment('');
      setJustReviewed(true);
      if (onReviewSubmit) onReviewSubmit();
    } catch (err) {
      // Only show generic error, not booking restriction
      setError('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white">
      {alreadyReviewed && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-center">
          You have already reviewed this provider.
        </div>
      )}
      <div className="mb-2 font-medium">Leave a Review</div>
      <div className="flex items-center mb-2">
        {[1,2,3,4,5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${alreadyReviewed ? 'opacity-50 cursor-not-allowed' : ''}`}
            onMouseEnter={() => !alreadyReviewed && setHoverRating(star)}
            onMouseLeave={() => !alreadyReviewed && setHoverRating(0)}
            onClick={() => !alreadyReviewed && setRating(star)}
            data-testid={`star-${star}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : ''}</span>
      </div>
      <Textarea
        className="mb-2"
        rows={3}
        placeholder="Write your review..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={500}
        required
        disabled={alreadyReviewed}
      />
      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}
      <Button type="submit" disabled={loading || alreadyReviewed}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
} 