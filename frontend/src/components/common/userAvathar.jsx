import React from 'react';

const UserAvatar = ({ name, avatar }) => {
  return (
    <img
      src={
        avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FE7C01&color=fff`
      }
      alt={`${name} Avatar`}
      className="w-16 h-16 rounded-2xl mx-auto border-3 border-white shadow-md"
    />
  );
};

export default UserAvatar;
