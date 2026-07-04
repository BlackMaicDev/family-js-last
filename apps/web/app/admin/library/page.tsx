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
  bookCategory?: { name: string };
}

export default function AdminLibraryPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [scrapeUrl, setScrapeUrl] = useState('');
  
  // Book Form State
  const [bookForm, setBookForm] = useState({
    title: '',
    authors: '',
    isbn: '',
    description: '',
    thumbnail: '',
    publisher: '',
    price: ''
  });


  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch Categories and Library Books
  useEffect(() => {
    fetchCategories();
    fetchLibraryBooks();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/book-categories`);
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

  // Autocomplete logic removed to prevent rate limiting (429)
  // Search is now manual via handleSearch function


  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl) return;

    setIsSearching(true);
    try {
      const res = await fetch(`${apiUrl}/books/scrape?url=${encodeURIComponent(scrapeUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setBookForm({
            title: data.title || '',
            authors: data.authors ? data.authors.join(', ') : '',
            isbn: data.isbn || '',
            description: data.description || '',
            thumbnail: data.thumbnail || '',
            publisher: data.publisher || '',
            price: data.price ? data.price.toString() : ''
          });
          setSuccessMessage('ดึงข้อมูลสำเร็จ! ตรวจสอบและแก้ไขก่อนบันทึก');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          alert('ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบ URL หรือกรอกข้อมูลด้วยตนเอง');
        }
      } else {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    } catch (err) {
      console.error('Scrape failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToLibrary = async () => {
    const bookData = {
      title: bookForm.title,
      authors: bookForm.authors.split(',').map(a => a.trim()).filter(a => a),
      isbn: bookForm.isbn,
      description: bookForm.description,
      thumbnail: bookForm.thumbnail,
      publisher: bookForm.publisher,
      price: bookForm.price ? parseFloat(bookForm.price) : undefined,
      bookCategoryId: selectedCategoryId
    };

    if (!bookData.title || !selectedCategoryId) {
      alert('กรุณากรอกชื่อหนังสือและเลือกหมวดหมู่');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bookData),
      });

      if (res.ok) {
        setSuccessMessage('เพิ่มหนังสือเข้าห้องสมุดแล้ว!');
        setBookForm({ title: '', authors: '', isbn: '', description: '', thumbnail: '', publisher: '', price: '' });
        setScrapeUrl('');
        fetchLibraryBooks();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
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
          <p className="text-sm text-gray-400">เพิ่มหนังสือเข้าคอลเลกชันด้วย Web Scraping (SE-ED, Naiin)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Search & Add */}
        <div className="space-y-6">
          {/* URL Scraping Section */}
          <div className="p-6 rounded-3xl bg-[#1A1A1A] border border-white/5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search size={20} className="text-[#C5A059]" />
              Auto-fill from SE-ED / Naiin
            </h2>
            
            <form onSubmit={handleScrape} className="relative flex gap-2">
              <input
                type="text"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="วางลิงก์หน้าหนังสือ หรือ กรอก ISBN เพื่อดึงข้อมูลอัตโนมัติ..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-[#C5A059]/50 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isSearching || !scrapeUrl}
                className="px-6 bg-[#C5A059] hover:bg-[#b58d60] disabled:bg-white/10 disabled:text-white/30 text-white font-bold rounded-2xl transition-all flex items-center gap-2"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'ดึงข้อมูล'}
              </button>
            </form>
          </div>

          {/* Book Form */}
          <div className="p-8 rounded-3xl bg-[#1A1A1A] border border-[#C5A059]/20 space-y-6 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#C5A059]"></div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                <Plus size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Book Details</h2>
              <span className="text-xs text-gray-500 ml-auto">อันไหนว่างสามารถเติมเองได้</span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Title *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]/50 transition-all"
                  placeholder="ชื่อหนังสือ"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Author / Translator</label>
                <input
                  type="text"
                  value={bookForm.authors}
                  onChange={(e) => setBookForm({ ...bookForm, authors: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]/50 transition-all"
                  placeholder="คั่นด้วยลูกน้ำ (,) หากมีหลายคน"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">ISBN</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]/50 transition-all"
                    placeholder="978..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={bookForm.thumbnail}
                    onChange={(e) => setBookForm({ ...bookForm, thumbnail: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]/50 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Publisher</label>
                  <input
                    type="text"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]/50 transition-all"
                    placeholder="สำนักพิมพ์"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Price</label>
                  <input
                    type="number"
                    value={bookForm.price}
                    onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]/50 transition-all"
                    placeholder="ราคา"
                  />
                </div>
              </div>
              
              {bookForm.thumbnail && (
                <div className="mt-2 mb-2">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Preview Cover</p>
                   <img src={bookForm.thumbnail} alt="Cover Preview" className="h-32 object-contain rounded border border-white/10" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Category *</label>
                <div className="relative">
                  <select 
                    value={selectedCategoryId} 
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-[#C5A059]/50 transition-all"
                  >
                    <option value="">เลือกหมวดหมู่...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleAddToLibrary}
                disabled={saving || !bookForm.title || !selectedCategoryId}
                className="w-full py-4 bg-[#C5A059] hover:bg-[#b58d60] disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#C5A059]/20 mt-4"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {saving ? 'Saving to Collection...' : 'Add to Collection'}
              </button>
            </div>
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
                        {book.bookCategory && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] rounded-md font-medium">
                            {book.bookCategory.name}
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
