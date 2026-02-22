import React from 'react';
import Link from 'next/link';
import { BookOpen, Dumbbell, Star, ChevronRight, Terminal, Clock } from 'lucide-react';
import { getFullUrl } from '../lib/utils';
import { useLanguage } from '@/app/contexts/LanguageContext';

const PostCard = ({ post }: { post: any }) => {
    const { t } = useLanguage();
    // Use category instead of categories since Prisma schema relation uses 'category'
    const categorySlug = post.category?.slug || '';

    const isWorkout = categorySlug.includes('workout') || categorySlug.includes('calisthenics') || categorySlug.includes('fit');
    const isCode = categorySlug.includes('code') || categorySlug.includes('dev') || categorySlug.includes('program');
    const isBook = categorySlug.includes('book') || categorySlug.includes('read');

    return (
        <Link href={`/blog/${post.slug || post.id}`} className="block h-full">
            <div className="group relative bg-white dark:bg-[#292524] rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 cursor-pointer h-full flex flex-col">

                <div className="relative h-64 overflow-hidden rounded-[1.5rem] flex-shrink-0 bg-stone-100 dark:bg-stone-800/50">
                    {post.thumbnail || post.cover_image ? (
                        <img
                            src={getFullUrl(post.thumbnail || post.cover_image)}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 font-medium">{t('home.noCover')}</div>
                    )}

                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold shadow-sm z-10 border border-white/20 dark:border-stone-700/50">
                        {isWorkout && <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1"><Dumbbell size={12} /> Workout</span>}
                        {isCode && <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Terminal size={12} /> Programming</span>}
                        {isBook && <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1"><BookOpen size={12} /> Book</span>}
                        {!isWorkout && !isCode && !isBook && <span className="text-stone-500 dark:text-stone-400">{post.category?.name || 'General'}</span>}
                    </div>
                </div>

                <div className="p-4 pt-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
                            {new Date(post.createdAt || post.created_at).toLocaleDateString('en-GB')}
                        </span>
                        <div className="h-px w-4 bg-stone-200"></div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
                            {post.meta_data?.difficulty || post.author?.nickname || post.meta_data?.author || 'General'}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3 leading-tight group-hover:text-[#C5A059] dark:group-hover:text-[#C5A059] transition-colors line-clamp-2">
                        {post.title}
                    </h3>

                    <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-2 leading-relaxed mb-6 font-light flex-grow">
                        {post.excerpt || post.content?.substring(0, 100) + '...'}
                    </p>

                    <div className="flex items-center justify-between border-t border-stone-50 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                            {post.meta_data?.duration && (
                                <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                                    <Clock size={12} /> {post.meta_data.duration}
                                </span>
                            )}
                            {(post.rating || post.meta_data?.rating) && (
                                <span className="bg-teal-50 text-teal-600 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                                    <Star size={12} className="fill-teal-600" /> {post.rating || post.meta_data?.rating}
                                </span>
                            )}
                            {post.meta_data?.tech_stack && (
                                <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 truncate max-w-[120px]">
                                    <Terminal size={12} /> {post.meta_data.tech_stack.split(',')[0]}
                                </span>
                            )}
                            {!post.meta_data?.duration && !post.rating && !post.meta_data?.rating && !post.meta_data?.tech_stack && (
                                <span className="text-xs text-stone-400 font-medium">{t('home.readArticle')}</span>
                            )}
                        </div>

                        <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-800/80 flex items-center justify-center text-stone-400 group-hover:bg-[#C5A059] group-hover:text-white transition-all">
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PostCard;
