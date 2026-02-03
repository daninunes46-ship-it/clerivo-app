import React from 'react';

const BentoCard = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 flex flex-col ${className}`}>
      {title && (
        <h3 className="text-zinc-500 text-sm font-medium mb-4 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default BentoCard;
