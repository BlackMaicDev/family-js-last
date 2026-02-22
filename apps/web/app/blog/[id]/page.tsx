'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Calendar, User, Tag, Star, BookOpen, Clock, ChevronLeft, Facebook, MessageCircle, Send, Link2, Share2, MessageSquare } from 'lucide-react';
import { getFullUrl } from '../../lib/utils';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PostDetail {
    id: string;
    title: string;
    content: string;
    thumbnail: string | null;
    status: string;
    rating: number | null;
    bookAuthor: string | null;
    createdAt: string;
    category: {
        name: string;
        slug: string;
    };
    author: {
        nickname: string;
        avatarUrl: string | null;
    };
    meta_data?: any;
}

export default function BlogDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();

    const [post, setPost] = useState<PostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
            const token = localStorage.getItem('token');
            if (token) {
                setIsLoggedIn(true);
            }
        }
    }, [id]);

    const fetchComments = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/comments/post/${id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error('Failed to load comments', err);
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/posts/${id}`);

                if (!res.ok) {
                    if (res.status === 404) throw new Error('Not found');
                    throw new Error('Failed to fetch post');
                }

                const data = await res.json();
                setPost(data);
                fetchComments();
            } catch (err: any) {
                console.error(err);
                setError(err.message === 'Not found' ? t('blog.notFound') : 'Failed to load story');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1c1917] flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#C5A059] mb-4" />
                <p className="text-stone-400 font-medium tracking-widest uppercase text-sm">{t('blog.loading')}</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1c1917] flex flex-col items-center justify-center px-6 text-center">
                <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800/50 rounded-full flex items-center justify-center mb-6">
                    <BookOpen strokeWidth={1.5} size={32} className="text-stone-300 dark:text-stone-500" />
                </div>
                <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">{error || t('blog.notFound')}</h1>
                <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-md">{t('blog.notFoundDesc')}</p>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-full font-bold text-sm hover:bg-[#C5A059] dark:hover:bg-[#C5A059] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                    <ArrowLeft size={16} /> {t('blog.returnHome')}
                </button>
            </div>
        );
    }

    // Formatting Date
    const dateStr = new Date(post.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !isLoggedIn) return;
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            let token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            const postComment = async (currentToken: string) => {
                const postIdStr = Array.isArray(id) ? id[0] : id;
                return fetch(`${apiUrl}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({ postId: postIdStr, content: newComment })
                });
            };

            let res = await postComment(token || '');

            if (res.status === 401 && refreshToken) {
                // Token might be expired, try refreshing
                const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    token = refreshData.accessToken;
                    localStorage.setItem('token', token!);
                    if (refreshData.refreshToken) {
                        localStorage.setItem('refreshToken', refreshData.refreshToken);
                    }
                    // Retry comment post with new token
                    res = await postComment(token!);
                } else {
                    setIsLoggedIn(false);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    alert('Session expired. Please log in again.');
                    return;
                }
            }

            if (res.ok) {
                setNewComment('');
                await fetchComments();
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Cannot parse error response' }));

                // Format validation errors (usually arrays from class-validator)
                const errorMessage = Array.isArray(errorData.message)
                    ? errorData.message.join(', ')
                    : errorData.message || JSON.stringify(errorData);

                alert(`Failed to post comment. Status: ${res.status}. Error: ${errorMessage}`);
            }
        } catch (err) {
            console.error('Error posting comment:', err);
            alert('Failed to connect to the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#1c1917] font-sans selection:bg-[#C5A059]/20 selection:text-[#8A6E3E] pb-32 transition-colors duration-500">

            {/* Header Overlay (Hidden Navbar is taken care of by Navbar component itself making it transparent) */}

            {/* Hero Header Area */}
            <div className="w-full relative pt-32 pb-12 overflow-hidden flex flex-col items-center">
                {/* Abstract Background for Typography */}
                <div className="absolute top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-[#f1efe9] dark:from-[#292524] to-transparent pointer-events-none transition-colors duration-500"></div>
                <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] bg-[#C5A059]/[0.03] rounded-[100%] blur-[80px] pointer-events-none"></div>

                <div className="w-full max-w-4xl mx-auto px-6 relative z-10 text-center">

                    {/* Metadata Row */}
                    <div className="mt-8 mb-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-stone-400 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="flex items-center gap-1.5 text-[#C5A059]">
                            <Tag size={14} />
                            {post.category?.name || t('blog.storyDefault')}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700"></span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {dateStr}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700"></span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {post.meta_data?.duration || '5 ' + t('blog.minRead')}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-800 dark:text-stone-100 tracking-tight leading-[1.15] mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 transition-colors duration-500">
                        {post.title}
                    </h1>

                    {/* Author info & Reviews if present */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        {/* Author */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 overflow-hidden bg-white dark:bg-[#292524] shadow-sm">
                                {post.author?.avatarUrl ? (
                                    <img src={getFullUrl(post.author.avatarUrl)} alt={post.author.nickname} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800/50 text-stone-400 font-bold">
                                        {post.author?.nickname?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-stone-800">{post.author?.nickname}</p>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400">{t('general.author')}</p>
                            </div>
                        </div>

                        {/* Book Info Conditional */}
                        {(post.rating || post.bookAuthor) && (
                            <>
                                <div className="hidden sm:block w-px h-8 bg-stone-200 dark:bg-stone-700"></div>
                                <div className="flex items-center gap-4 bg-white/60 dark:bg-[#292524]/60 px-4 py-2 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 shadow-sm backdrop-blur-md">
                                    {post.bookAuthor && (
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400">{t('blog.bookAuthor')}</p>
                                            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">{post.bookAuthor}</p>
                                        </div>
                                    )}
                                    {post.rating && (
                                        <div className="flex items-center gap-1 text-[#C5A059]">
                                            <Star size={16} fill="currentColor" />
                                            <span className="font-bold ml-1 text-sm">{post.rating}/5</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">

                {/* Thumbnail Image */}
                {post.thumbnail && (
                    <div className="mb-16 w-full aspect-[16/9] md:aspect-[2/1] relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] group animate-in zoom-in-95 fade-in duration-1000 delay-500 bg-stone-100 dark:bg-stone-800">
                        <img
                            src={getFullUrl(post.thumbnail)}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        />
                        {/* Subtle Inner Shadow */}
                        <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-[2rem] pointer-events-none"></div>
                    </div>
                )}

                {/* Content Body */}
                <div className="max-w-[700px] mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">

                    {/* Custom CSS Wrapper for Rich Text Content */}
                    <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: post.content }} />

                    <style jsx global>{`
            .rich-text-content {
              color: #57534e; /* text-stone-600 */
              line-height: 1.8;
              font-size: 1.125rem;
              font-weight: 300;
            }
            .rich-text-content h1, 
            .rich-text-content h2, 
            .rich-text-content h3, 
            .rich-text-content h4 {
              color: #292524; /* text-stone-800 */
              font-weight: 800;
              line-height: 1.3;
              margin-top: 2em;
              margin-bottom: 0.75em;
              letter-spacing: -0.025em;
            }
            .rich-text-content h1 { font-size: 2.25rem; }
            .rich-text-content h2 { font-size: 1.875rem; }
            .rich-text-content h3 { font-size: 1.5rem; }
            .rich-text-content p {
              margin-top: 1.25em;
              margin-bottom: 1.25em;
            }
            .rich-text-content a {
              color: #C5A059;
              font-weight: 600;
              text-decoration: none;
              transition: all 0.2s;
            }
            .rich-text-content a:hover {
              text-decoration: underline;
            }
            .rich-text-content blockquote {
              border-left: 4px solid #C5A059;
              background-color: #fafaf9; /* bg-stone-50 */
              color: #44403c; /* text-stone-700 */
              font-style: italic;
              padding: 1rem 1.5rem;
              margin: 2em 0;
              border-top-right-radius: 1rem;
              border-bottom-right-radius: 1rem;
            }
            .rich-text-content img {
              border-radius: 1.5rem;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
              border: 1px solid #f5f5f4;
              margin: 2.5em auto;
              max-width: 100%;
              height: auto;
            }
            .rich-text-content ul, 
            .rich-text-content ol {
              padding-left: 1.5em;
              margin-top: 1.25em;
              margin-bottom: 1.25em;
            }
            .rich-text-content li {
              margin-top: 0.5em;
              margin-bottom: 0.5em;
            }
            .rich-text-content ul { list-style-type: disc; }
            .rich-text-content ol { list-style-type: decimal; }
            .rich-text-content li::marker { color: #C5A059; }
          `}</style>

                </div>

            </div>

            {/* Share Section */}
            <div className="max-w-[700px] mx-auto mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000">
                <p className="text-sm font-bold text-stone-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Share2 size={16} /> Share this story
                </p>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
                            window.open(url, '_blank', 'width=600,height=400');
                        }}
                        className="w-12 h-12 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center hover:bg-[#1877f2] hover:text-white transition-all hover:scale-110 shadow-sm"
                        title="Share to Facebook"
                    >
                        <Facebook size={20} />
                    </button>
                    <button
                        onClick={() => {
                            const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`;
                            window.open(url, '_blank', 'width=600,height=400');
                        }}
                        className="w-12 h-12 rounded-full bg-[#06c755]/10 text-[#06c755] flex items-center justify-center hover:bg-[#06c755] hover:text-white transition-all hover:scale-110 shadow-sm"
                        title="Share to LINE"
                    >
                        <MessageCircle size={20} />
                    </button>
                    <button
                        onClick={() => {
                            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                            if (isMobile) {
                                window.location.href = `fb-messenger://share/?link=${encodeURIComponent(currentUrl)}`;
                            } else {
                                // Fallback open messenger app link
                                window.location.href = `fb-messenger://share/?link=${encodeURIComponent(currentUrl)}`;
                            }
                        }}
                        className="w-12 h-12 rounded-full bg-[#00b2ff]/10 text-[#00b2ff] flex items-center justify-center hover:bg-[#00b2ff] hover:text-white transition-all hover:scale-110 shadow-sm"
                        title="Share to Messenger"
                    >
                        <Send size={20} />
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(currentUrl);
                            alert('Link copied to clipboard!');
                        }}
                        className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 transition-all hover:scale-110 shadow-sm"
                        title="Copy Link"
                    >
                        <Link2 size={20} />
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            <div className="max-w-[700px] mx-auto mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
                    <MessageSquare size={20} className="text-[#C5A059]" /> Comments ({comments.length})
                </h3>

                {isLoggedIn ? (
                    <form onSubmit={handleCommentSubmit} className="mb-8 relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-white dark:bg-[#292524] border border-stone-200 dark:border-stone-700 rounded-2xl p-4 text-sm font-medium outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all resize-none shadow-sm"
                            rows={3}
                            disabled={isSubmitting}
                        ></textarea>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="absolute bottom-3 right-3 px-4 py-2 bg-[#C5A059] text-white text-xs font-bold rounded-xl hover:bg-[#b58d60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Post
                        </button>
                    </form>
                ) : (
                    <div className="mb-8 p-6 rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-center border border-stone-200 dark:border-stone-700">
                        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3 block">Please log in to leave a comment or join the discussion.</p>
                        <Link href="/login" className="inline-block px-5 py-2.5 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 text-xs font-bold rounded-full hover:bg-[#C5A059] dark:hover:bg-[#C5A059] transition-all shadow-sm">
                            Log In
                        </Link>
                    </div>
                )}

                <div className="space-y-6">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0 bg-white dark:bg-[#292524]">
                                    {comment.user?.avatarUrl ? (
                                        <img src={getFullUrl(comment.user.avatarUrl)} alt={comment.user.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-400 font-bold uppercase">
                                            {comment.user?.nickname?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 bg-white dark:bg-[#292524] p-4 rounded-2xl rounded-tl-none border border-stone-200 dark:border-stone-700 shadow-sm">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <h4 className="font-bold text-sm text-stone-800 dark:text-stone-100">{comment.user?.nickname || 'Unknown'}</h4>
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                            {new Date(comment.createdAt).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-stone-500 text-center py-6 font-medium italic">No comments yet. Be the first to start the discussion!</p>
                    )}
                </div>
            </div>

            {/* Back Button Footer */}
            {/* <div className="max-w-[700px] mx-auto mt-20 pt-10 border-t border-stone-200 px-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-stone-500 hover:text-[#C5A059] transition-colors font-medium text-sm group"
                >
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-[#C5A059]/10 group-hover:-translate-x-1 transition-all">
                        <ChevronLeft size={16} />
                    </div>
                    Back to Home
                </Link>
            </div> */}

        </div>
    );
}
