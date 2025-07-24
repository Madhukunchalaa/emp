import React from 'react';
import { User } from 'lucide-react';

<<<<<<< HEAD
const UserAvatar = ({ name, avatar }) => {
  const showImage = avatar;

  return (
    <div className="w-16 h-16 rounded-full mx-auto border-4 border-white shadow-md bg-orange-500 flex items-center justify-center">
=======
const UserAvatar = ({ name, avatar, size = 'sm', className = '' }) => {
  const showImage = avatar;
  const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-16 h-16' : size;
  return (
    <div className={`rounded-full mx-auto border-4 border-green-500 shadow-md bg-white flex items-center justify-center ${sizeClass} ${className}`}>
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
      {showImage ? (
        <img
          src={
            avatar ||
<<<<<<< HEAD
            `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar)}&background=FE7C01&color=fff`
=======
            `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar)}&background=10B981&color=fff`
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
          }
          alt={`${name} Avatar`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
<<<<<<< HEAD
        <User className="w-6 h-6 text-white" />
=======
        <User className="w-6 h-6 text-green-600" />
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
      )}
    </div>
  );
};

export default UserAvatar;
