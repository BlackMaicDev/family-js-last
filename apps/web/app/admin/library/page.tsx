'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Book as BookIcon,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
  Info,
  Library
} from 'lucide-react';
import { getFullUrl } from '../../lib/utils';

interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  thumbnail?: string;
  isbn?: string;
  pageCount?: number;
  categories: string[];
}

interface Category {
  id: string;
  name: string;
}

interface LibraryBook {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  category?: { name: string };
}

export default function AdminLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch Categories and Library Books
  useEffect(() => {
    fetchCategories();
    fetchLibraryBooks();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (err) {}
  };

  const fetchLibraryBooks = async () => {
    try {
      setLoadingLibrary(true);
      const res = await fetch(`${apiUrl}/books`);
      if (res.ok) setLibraryBooks(await res.json());
    } catch (err) {} finally {
      setLoadingLibrary(false);
    }
  };

  // Autocomplete logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch(`${apiUrl}/books/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        setSuggestions(await res.json());
      }
    } catch (err) {} finally {
      setIsSearching(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!selectedBook || !selectedCategoryId) {
      alert('กรุณาเลือกหนังสือและหมวดหมู่');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: selectedBook.title,
          authors: selectedBook.authors,
          description: selectedBook.description,
          thumbnail: selectedBook.thumbnail,
          isbn: selectedBook.isbn,
          pageCount: selectedBook.pageCount,
          categories: selectedBook.categories,
          categoryId: selectedCategoryId,
        }),
      });

      if (res.ok) {
        setSuccessMessage('เพิ่มหนังสือเข้าห้องสมุดแล้ว!');
        setSelectedBook(null);
        setSearchQuery('');
        setSuggestions([]);
        fetchLibraryBooks();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const err = await res.json();
        alert(err.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือเล่มนี้?')) return;
    
    try {
      const res = await fetch(`${apiUrl}/books/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchLibraryBooks();
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-[100] animate-toast-in">
          <div className="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-[#C5A059]/10 text-[#C5A059]">
          <Library size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Library Management</h1>
          <p className="text-sm text-gray-400">ค้นหาและเพิ่มหนังสือเข้าห้องสมุดดิจิทัล</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Search & Add */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#1A1A1A] border border-white/5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search size={20} className="text-[#C5A059]" />
              Find New Book
            </h2>
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อหนังสือเพื่อค้นหา..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-[#C5A059]/50 transition-all pl-12"
              />
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              {isSearching && (
                <Loader2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C5A059] animate-spin" />
              )}
              
              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && !selectedBook && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#242424] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[400px] overflow-y-auto">
                  {suggestions.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book);
                        setSuggestions([]);
                        setSearchQuery(book.title);
                      }}
                      className="w-full p-4 flex gap-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      {book.thumbnail ? (
                        <img src={book.thumbnail} alt="" className="w-12 h-16 object-cover rounded shadow-md" />
                      ) : (
                        <div className="w-12 h-16 bg-white/5 rounded flex items-center justify-center">
                          <BookIcon size={16} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{book.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{book.authors.join(', ')}</p>
                        {book.categories?.[0] && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-500">
                            {book.categories[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Book Preview */}
            {selectedBook && (
              <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/5 space-y-6 animate-fade-in">
                <div className="flex gap-6">
                  {selectedBook.thumbnail && (
                    <img src={selectedBook.thumbnail} alt={selectedBook.title} className="w-32 h-44 object-cover rounded-xl shadow-2xl" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-white leading-tight">{selectedBook.title}</h3>
                      <button onClick={() => setSelectedBook(null)} className="text-gray-500 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>
                    <p className="text-sm text-[#C5A059]">{selectedBook.authors.join(', ')}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedBook.isbn && <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400">ISBN: {selectedBook.isbn}</span>}
                      {selectedBook.pageCount && <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400">{selectedBook.pageCount} pages</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Category</label>
                    <div className="relative">
                      <select 
                        value={selectedCategoryId} 
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-[#C5A059]/50"
                      >
                        <option value="">เลือกหมวดหมู่เพื่อแสดงในห้องสมุด...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    onClick={handleAddToLibrary}
                    disabled={saving}
                    className="w-full py-4 bg-[#C5A059] hover:bg-[#b58d60] disabled:bg-gray-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#C5A059]/20"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {saving ? 'Adding to Library...' : 'Add to Collection'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Collection List */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#1A1A1A] border border-white/5 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Library size={20} className="text-[#C5A059]" />
                Current Collection
              </h2>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {libraryBooks.length} Books
              </span>
            </div>

            {loadingLibrary ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={24} className="animate-spin text-[#C5A059]" />
                <p className="text-sm text-gray-500 tracking-wide">กำลังโหลดรายการหนังสือ...</p>
              </div>
            ) : libraryBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                  <Info size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-medium">ยังไม่มีหนังสือในคอลเลกชัน</p>
                  <p className="text-xs text-gray-500">เริ่มค้นหาและเพิ่มหนังสือจากด้านซ้ายมือ</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {libraryBooks.map((book) => (
                  <div 
                    key={book.id} 
                    className="group p-4 bg-white/5 border border-transparent hover:border-white/10 rounded-2xl flex gap-4 transition-all"
                  >
                    {book.thumbnail ? (
                      <img src={book.thumbnail} alt="" className="w-12 h-16 object-cover rounded shadow-md" />
                    ) : (
                      <div className="w-12 h-16 bg-white/10 rounded flex items-center justify-center">
                        <BookIcon size={16} className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{book.authors.join(', ')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {book.category && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] rounded-md font-medium">
                            {book.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteBook(book.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all self-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toast-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-toast-in { animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}
