'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Info, 
  Loader2, 
  Star,
  BookOpen,
  User as UserIcon,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Bookshelf } from '../../components/Library/BookshelfComponents';
import { Book, Category } from '../../components/Library/types';


export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, catsRes] = await Promise.all([
        fetch(`${apiUrl}/books`),
        fetch(`${apiUrl}/categories`)
      ]);
      
      if (booksRes.ok && catsRes.ok) {
        setBooks(await booksRes.json());
        setCategories(await catsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch library data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group books by category
  const groupedBooks = categories.map(cat => ({
    category: cat,
    books: books.filter(b => b.categoryId === cat.id)
  })).filter(group => group.books.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center flex-col gap-4">
        <Loader2 size={40} className="animate-spin text-[#C5A059] opacity-50" />
        <p className="text-[#C5A059] text-sm tracking-[0.3em] font-light uppercase animate-pulse">
          Opening Library doors...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white selection:bg-[#C5A059]/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C5A059]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C5A059]/5 blur-[120px] rounded-full" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-24">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-16">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#C5A059]/50">
              The Vault
            </h1>
            <p className="text-[#C5A059]/60 text-xs font-bold tracking-[0.4em] uppercase">
              Digital Knowledge Collection
            </p>
          </div>

          {selectedShelf && (
            <button 
              onClick={() => setSelectedShelf(null)}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-[#C5A059]/50 transition-all"
            >
              <ArrowLeft size={18} className="text-[#C5A059] group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Hall</span>
            </button>
          )}
        </div>

        {/* Library Floor / Room */}
        <div className="relative">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32 gap-x-12 transition-all duration-1000 ${
            selectedShelf ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
          }`}>
            {groupedBooks.map((group) => (
              <Bookshelf 
                key={group.category.id} 
                category={group.category} 
                books={group.books}
                onSelectBook={(book) => setSelectedBook(book)}
                onSelectShelf={() => setSelectedShelf(group.category.id)}
                isFocused={false}
                isOtherFocused={false}
              />
            ))}

            {groupedBooks.length === 0 && (
              <div className="col-span-full py-32 text-center space-y-4">
                <Info size={40} className="mx-auto text-gray-700" />
                <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลหนังสือในห้องสมุด</p>
                <Link href="/admin/library" className="inline-block text-[#C5A059] text-sm hover:underline">
                  Go to Admin to add books
                </Link>
              </div>
            )}
          </div>

          {/* Focused Shelf View */}
          {selectedShelf && (
            <div className="absolute top-0 left-0 right-0 flex justify-center animate-zoom-in py-12">
              {groupedBooks.filter(g => g.category.id === selectedShelf).map(group => (
                <Bookshelf 
                  key={group.category.id} 
                  category={group.category} 
                  books={group.books}
                  onSelectBook={(book) => setSelectedBook(book)}
                  onSelectShelf={() => setSelectedShelf(null)}
                  isFocused={true}
                  isOtherFocused={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Detail Overlay */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-[#0c0c0c]/90 backdrop-blur-xl animate-fade-in"
            onClick={() => setSelectedBook(null)}
          />
          
          <div className="relative w-full max-w-4xl bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl animate-slide-up flex flex-col md:flex-row">
            {/* Book Preview Side */}
            <div className="md:w-[40%] bg-gradient-to-br from-[#242424] to-[#121212] p-10 flex flex-col items-center justify-center gap-8 border-r border-white/5">
              {selectedBook.thumbnail ? (
                <img 
                  src={selectedBook.thumbnail} 
                  alt={selectedBook.title} 
                  className="w-full max-w-[200px] aspect-[2/3] object-cover rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10"
                />
              ) : (
                <div className="w-52 h-72 bg-white/5 rounded-2xl flex items-center justify-center">
                  <BookOpen size={64} className="text-white/10" />
                </div>
              )}
              
              <div className="flex flex-wrap justify-center gap-3">
                {selectedBook.categories?.slice(0, 3).map(cat => (
                  <span key={cat} className="px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-[60%] p-10 md:p-14 space-y-8 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    {selectedBook.title}
                  </h2>
                  <button onClick={() => setSelectedBook(null)} className="p-2 rounded-full hover:bg-white/5 text-gray-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-[#C5A059]">
                  <UserIcon size={18} />
                  <span className="text-lg font-medium tracking-tight">
                    {selectedBook.authors.join(', ')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-white/10" />
                  Description
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  {selectedBook.description || 'No description available for this volume.'}
                </p>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">ISBN</p>
                  <p className="text-sm font-mono text-white/80">{selectedBook.isbn || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Pages</p>
                  <p className="text-sm font-mono text-white/80">{selectedBook.pageCount || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}
