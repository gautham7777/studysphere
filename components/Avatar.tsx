
import React from 'react';
// FIX: Added file extension to import
import { User } from '../types.ts';

interface AvatarProps {
  user: User | { username: string; profilePicUrl: string | null };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
};

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '' }) => {
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  const colorClasses = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500'
  ];
  
  // Simple hash function to get a consistent color for a user
  const getColor = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colorClasses.length);
    return colorClasses[index];
  };

  return (
    <div
      className={`relative rounded-full flex items-center justify-center font-bold text-white ${sizeClasses[size]} ${className}`}
    >
      {user.profilePicUrl ? (
        <img src={user.profilePicUrl} alt={user.username} className="rounded-full w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full rounded-full flex items-center justify-center ${getColor(user.username)}`}>
          {getInitials(user.username)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
