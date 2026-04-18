'use client';

import React from 'react';

// Note: I don't see framer-motion in package.json, so I will check if it's installed.
// If not, I'll use standard CSS transitions.
// Actually, I'll check first.

import { Book } from './types';

interface ShelfProps {
  category: { id: string; name: string };
  books: Book[];
  onSelectBook: (book: Book) => void;
  onSelectShelf: () => void;
  isFocused: boolean;
  isOtherFocused: boolean;
}

export const Bookshelf: React.FC<ShelfProps> = ({
  category,
  books,
  onSelectBook,
  onSelectShelf,
  isFocused,
  isOtherFocused
}) => {
  return (
    <div
      onClick={onSelectShelf}
      className={`relative transition-all duration-700 cursor-pointer ${isOtherFocused ? 'opacity-20 blur-sm scale-95 pointer-events-none' : 'opacity-100'
        } ${isFocused ? 'scale-110 z-20' : 'z-10'}`}
    >
      {/* Category Label */}
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#C5A059]/30 text-[#C5A059] text-xs font-bold tracking-widest uppercase transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-40'}`}>
        {category.name}
      </div>

      {/* SVG Bookshelf Structure */}
      <div className="relative w-64 h-80 flex flex-col justify-end perspective-1000">
        {/* Wooden Shelf Body */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#2a1d15] to-[#1a120c] rounded-t-lg shadow-2xl border-x border-t border-white/5"
          style={{
            boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)',
            transform: 'perspective(1000px) rotateX(2deg)'
          }}
        />

        {/* Horizontal Shelves */}
        <div className="absolute bottom-4 left-2 right-2 h-2 bg-[#3d2b1f] shadow-lg rounded-sm" />
        <div className="absolute bottom-1/2 left-2 right-2 h-2 bg-[#3d2b1f] shadow-lg rounded-sm" />

        {/* Books Container */}
        <div className="relative px-4 pb-6 flex items-end gap-[1px] h-full">
          {books.map((book, idx) => (
            <BookSpine
              key={book.id}
              book={book}
              index={idx}
              onSelect={() => onSelectBook(book)}
              isFocusedOnShelf={isFocused}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const BookSpine: React.FC<{ book: Book; index: number; onSelect: () => void; isFocusedOnShelf: boolean }> = ({
  book,
  index,
  onSelect,
  isFocusedOnShelf
}) => {
  // Generate a distinct color based on index or title
  const colors = [
    'linear-gradient(to right, #4a2c2a, #2a1817)',
    'linear-gradient(to right, #1a2a4a, #0c1525)',
    'linear-gradient(to right, #2a4a2a, #122212)',
    'linear-gradient(to right, #4a4a2a, #222210)',
    'linear-gradient(to right, #4a2a4a, #221222)',
  ];
  const color = colors[index % colors.length];

  // Random height variation
  const heights = ['h-32', 'h-36', 'h-28', 'h-40'];
  const height = heights[index % heights.length];

  return (
    <div
      onClick={(e) => {
        if (!isFocusedOnShelf) return;
        e.stopPropagation();
        onSelect();
      }}
      className={`group relative ${height} w-6 transition-all duration-300 transform-gpu origin-bottom cursor-pointer hover:-translate-y-2 hover:z-50`}
      style={{
        background: color,
        boxShadow: '1px 0 3px rgba(0,0,0,0.4)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '2px 2px 0 0'
      }}
    >
      {/* Gold Label Lines */}
      <div className="absolute top-2 left-0 right-0 h-[1px] bg-[#C5A059]/30" />
      <div className="absolute bottom-2 left-0 right-0 h-[1px] bg-[#C5A059]/30" />

      {/* Book Title Vertical */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="text-[8px] font-bold text-[#C5A059]/50 uppercase tracking-tighter whitespace-nowrap rotate-90 opacity-0 group-hover:opacity-100 transition-opacity">
          {book.title}
        </span>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all" />
    </div>
  );
};
