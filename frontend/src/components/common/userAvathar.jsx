import React from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ name, avatar }) => {
  const showImage = avatar;

  return (
    <div className="w-16 h-16 rounded-full mx-auto border-4 border-white shadow-md bg-orange-500 flex items-center justify-center">
      {showImage ? (
        <img
          src={
            avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar)}&background=FE7C01&color=fff`
          }
          alt={`${name} Avatar`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <User className="w-6 h-6 text-white" />
      )}
    </div>
  );
};

export default UserAvatar;
