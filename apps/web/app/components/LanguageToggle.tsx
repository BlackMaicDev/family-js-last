'use client';

import * as React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10 opacity-0"></div>;
    }

    return (
        <button
            onClick={toggleLanguage}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#292524] dark:hover:bg-[#44403c] transition-colors border border-transparent dark:border-[#44403c] overflow-hidden group"
            aria-label="Toggle Language"
        >
            <div className="absolute transition-transform duration-300 transform-gpu translate-y-0 group-hover:-translate-y-8 flex flex-col items-center">
                <Languages className="h-[1.1rem] w-[1.1rem] text-stone-600 dark:text-stone-300 group-hover:text-[#C5A059] dark:group-hover:text-[#C5A059] transition-all" />
            </div>

            <div className="absolute transition-transform duration-300 transform-gpu translate-y-8 group-hover:translate-y-0 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-[#C5A059] tracking-wider font-sans">
                    {language === 'th' ? 'EN' : 'TH'}
                </span>
            </div>
        </button>
    );
}
