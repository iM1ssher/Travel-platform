"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Calendar,
  User,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { FavoriteToggle } from "@/app/components/favorite-toggle";
import { useAuth } from "@/app/providers";

type Trip = {
  id: number;
  title: string;
  summary: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  reviewCount: number;
  author: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
};

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
};

type Participation = {
  id: number | null;
  status: string | null;
};

export default function TripDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [participation, setParticipation] = useState<Participation>({ id: null, status: null });
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch trip details
        const tripRes = await fetch(`/api/trips/${id}`);
        if (!tripRes.ok) {
          setTrip(null);
          return;
        }
        const tripData = await tripRes.json();
        setTrip(tripData);

        // Fetch reviews
        const reviewsRes = await fetch(`/api/reviews?tripId=${id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }

        // Check participation status
        if (user) {
          const participationRes = await fetch(`/api/trips/${id}/participate`);
          if (participationRes.ok) {
            const participationData = await participationRes.json();
            setParticipation(participationData.participation || { id: null, status: null });
          }
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id, user]);

  const handleJoinTrip = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/trips/${id}/participate`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setParticipation({ id: data.id, status: data.status });
      }
    } catch (error) {
      console.error('Error joining trip:', error);
    }
  };

  const handleLeaveTrip = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/trips/${id}/participate`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setParticipation({ id: null, status: null });
        // Remove user's review if exists
        setReviews(reviews.filter(review => review.reviewer.id !== user.id));
      }
    } catch (error) {
      console.error('Error leaving trip:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !participation.id) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setShowReviewForm(false);
        setReviewComment("");
        setReviewRating(5);
        // Refresh trip data to get updated rating
        const tripRes = await fetch(`/api/trips/${id}`);
        if (tripRes.ok) {
          const updatedTrip = await tripRes.json();
          setTrip(updatedTrip);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">載入中...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">找不到此行程</h1>
          <p className="text-slate-500 mb-6">這個行程可能已被刪除或不存在。</p>
          <Link href="/" className="text-blue-600 hover:underline">回到首頁</Link>
        </div>
      </div>
    );
  }

  const hasUserReview = reviews.some(review => review.reviewer.id === user?.id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ChevronLeft size={20} />
            回到首頁
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Trip Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          {trip.coverImage && (
            <div className="h-64 bg-slate-200 relative">
              <img
                src={trip.coverImage}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{trip.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <Link href={`/planner/${trip.author.id}`} className="text-blue-600 hover:underline">
                      {trip.author.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </div>
                  {trip.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-current text-amber-400" />
                      {trip.averageRating.toFixed(1)} ({trip.reviewCount} 則評論)
                    </div>
                  )}
                </div>
              </div>

              {user && (
                <div className="flex gap-3">
                  <FavoriteToggle
                    endpoint={`/api/trips/${id}/favorite`}
                    allowedRoles={["traveler", "planner"]}
                    activeLabel="已收藏"
                    inactiveLabel="收藏行程"
                    variant="ghost"
                  />
                  {participation.id ? (
                    <>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        disabled={hasUserReview}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {hasUserReview ? '已評論' : '寫評論'}
                      </button>
                      <button
                        onClick={handleLeaveTrip}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
                      >
                        離開行程
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleJoinTrip}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                    >
                      加入行程
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-slate-700 leading-relaxed">{trip.summary}</p>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && participation.id && !hasUserReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">寫下你的評論</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">評分</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`w-8 h-8 ${star <= reviewRating ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    <Star size={32} className="fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">評論（選填）</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="分享你的旅程體驗..."
                className="w-full p-3 border border-slate-300 rounded-xl resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300"
              >
                {submittingReview ? '提交中...' : '提交評論'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare size={24} />
            評論 ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <MessageSquare size={32} className="mx-auto mb-2 text-slate-400" />
              <p>還沒有評論</p>
              <p className="text-sm">加入這個行程並分享你的體驗吧！</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      {review.reviewer.avatarUrl ? (
                        <img
                          src={review.reviewer.avatarUrl}
                          alt={review.reviewer.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-600">
                          {review.reviewer.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900">{review.reviewer.name}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${
                                star <= review.rating ? 'text-amber-400' : 'text-slate-300'
                              } fill-current`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-slate-700">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
