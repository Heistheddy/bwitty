import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-black font-bold text-2xl">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-3xl leading-none">BWITTY NG LTD</span>
            <span className="text-sm text-pink-400">Everything Bwitty</span>
          </div>
        </div>
        
        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-gray-300 mt-4 text-sm">Loading your shopping experience...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;