"use client"
import React, { useState } from 'react';
import { createLike } from '@/lib/route';

const Like = ({ post }:any) => {
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(post.initiallyLiked || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await createLike(post.id);
      if (response.error) {
        console.error(response.error.message);
      } else {
        setLikeCount(response.likeCount);
        setIsLiked(response.isLiked);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`px-4 py-2 rounded-full focus:outline-none ${
          isLiked ? 'bg-blue-600' : 'bg-blue-500'
        } text-white shadow-md transform transition-transform duration-150 ease-in-out ${
          isLoading ? 'scale-105' : (isLiked ? 'scale-105' : 'hover:scale-105')
        }`}
      >
        {isLiked ? 'Unlike' : 'Like'}
      </button>
      <span className="text-gray-700 font-semibold">{likeCount}</span>
    </div>
  );
};

export default Like;
