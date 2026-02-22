'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, Language } from './dictionaries';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'th', // Default is Thai
    toggleLanguage: () => { },
    setLanguage: () => { },
    t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('th');

    // Load language preference from localStorage on mount
    useEffect(() => {
        const storedLang = localStorage.getItem('family-js-lang') as Language;
        if (storedLang && (storedLang === 'th' || storedLang === 'en')) {
            setLanguageState(storedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('family-js-lang', lang);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'th' ? 'en' : 'th');
    };

    const t = (key: string): string => {
        const keys = key.split('.');

        // Look up in the dictionary tree
        let current: any = dictionaries[language];
        let found = true;

        for (const part of keys) {
            if (current[part] !== undefined) {
                current = current[part];
            } else {
                found = false;
                break;
            }
        }

        // Attempt direct flat structure lookup (since dictionaries.ts mapped out as flat strings)
        if (dictionaries[language][key as keyof typeof dictionaries['th']]) {
            return dictionaries[language][key as keyof typeof dictionaries['th']];
        }

        return found ? current : key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
