import React from 'react';
export default function AuthPlaceholder({ title }: { title: string }) {
  return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="mt-4 text-gray-500">Component pending complete implementation</p>
  </div>;
}
