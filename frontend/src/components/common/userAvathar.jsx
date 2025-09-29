import React from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ name, avatar, size = 'sm', className = '' }) => {
  const showImage = !!avatar;
  const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-16 h-16' : size;
  return (
    <div className={`rounded-full mx-auto border-4 border-green-500 shadow-md bg-white flex items-center justify-center ${sizeClass} ${className}`}>
      {showImage ? (
        <img
          src={
            avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=10B981&color=fff`
          }
          alt={`${name} Avatar`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <User className="w-6 h-6 text-green-600" />
      )}
    </div>
  );
};

export default UserAvatar;
