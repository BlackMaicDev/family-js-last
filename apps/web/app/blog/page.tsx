'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, LayoutGrid, Search } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/app/contexts/LanguageContext';
import PostCard from '@/app/components/PostCard';

export default function AllBlogPage() {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await axios.get(`${API_URL}/posts`);
                setPosts(res.data || []);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-background font-sans selection:bg-[#C5A059]/20 selection:text-[#8A6E3E] transition-colors duration-500 pt-32 pb-24">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-4xl sm:text-5xl font-black text-stone-800 dark:text-stone-100 tracking-tight uppercase mb-4">
                        All <span className="text-[#C5A059]">Stories</span>
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
                        Explore our complete collection of articles, insights, and stories.
                    </p>
                </div>

                <div className="mb-12 max-w-md mx-auto relative animate-in fade-in zoom-in duration-1000 delay-300">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-stone-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-sm outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
                        <Loader2 size={40} className="animate-spin text-[#C5A059]" />
                        <p className="font-medium tracking-wide">Loading stories...</p>
                    </div>
                ) : (
                    <>
                        {filteredPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map(post => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[3rem] mx-auto max-w-lg bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
                                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300 dark:text-stone-600">
                                    <LayoutGrid size={24} />
                                </div>
                                <p className="text-stone-500 dark:text-stone-400 font-medium px-6 leading-relaxed">
                                    No stories found matching your criteria.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
