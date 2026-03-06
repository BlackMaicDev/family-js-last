'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Code,
    Undo,
    Redo,
    Minus,
    Type,
    Palette,
    RemoveFormatting,
    X,
    Maximize2,
    Move,
} from 'lucide-react';
import { compressImage } from '../../lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

// --- Toolbar Button ---
function ToolbarButton({
    icon: Icon,
    label,
    onClick,
    active,
    className,
}: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    active?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`
        p-1.5 rounded-lg transition-all duration-150
        ${active
                    ? 'bg-[var(--rte-accent)]/15 text-[var(--rte-accent)]'
                    : 'text-[var(--rte-muted)] hover:text-[var(--rte-fg)] hover:bg-[var(--rte-hover)]'
                }
        ${className || ''}
      `}
        >
            <Icon size={16} />
        </button>
    );
}

// --- Separator ---
function ToolbarSep() {
    return <div className="w-px h-5 bg-[var(--rte-border)] mx-0.5" />;
}

// --- Image Toolbar Popup ---
function ImageToolbar({
    img,
    onClose,
    onUpdate,
}: {
    img: HTMLImageElement;
    onClose: () => void;
    onUpdate: () => void;
}) {
    const [width, setWidth] = useState(img.style.width || `${img.naturalWidth}px`);
    const [height, setHeight] = useState(img.style.height || 'auto');

    useEffect(() => {
        setWidth(img.style.width || (img.naturalWidth ? `${img.naturalWidth}px` : '100%'));
        setHeight(img.style.height || 'auto');
    }, [img]);

    const applySize = () => {
        img.style.width = width.includes('%') || width.includes('px') ? width : `${width}px`;
        img.style.height = height === 'auto' || !height ? 'auto' : height.includes('px') ? height : `${height}px`;
        onUpdate();
    };

    const applyAlign = (align: 'left' | 'center' | 'right') => {
        // Remove existing alignment
        img.style.float = 'none';
        img.style.marginLeft = '';
        img.style.marginRight = '';
        img.style.display = '';

        if (align === 'left') {
            img.style.float = 'left';
            img.style.marginRight = '16px';
            img.style.marginBottom = '8px';
        } else if (align === 'right') {
            img.style.float = 'right';
            img.style.marginLeft = '16px';
            img.style.marginBottom = '8px';
        } else {
            img.style.display = 'block';
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
        }
        onUpdate();
    };

    const applyPresetSize = (preset: string) => {
        switch (preset) {
            case 'small':
                img.style.width = '25%';
                setWidth('25%');
                break;
            case 'medium':
                img.style.width = '50%';
                setWidth('50%');
                break;
            case 'large':
                img.style.width = '75%';
                setWidth('75%');
                break;
            case 'full':
                img.style.width = '100%';
                setWidth('100%');
                break;
        }
        img.style.height = 'auto';
        setHeight('auto');
        onUpdate();
    };

    return (
        <div
            className="absolute z-50 animate-img-toolbar"
            style={{
                top: img.offsetTop - 4,
                left: Math.max(0, img.offsetLeft),
            }}
        >
            <div className="bg-[var(--rte-toolbar-bg)] border border-[var(--rte-border)] rounded-xl shadow-2xl shadow-black/40 p-3 min-w-[280px] backdrop-blur-md">
                {/* Close */}
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-[var(--rte-muted)] uppercase tracking-wider flex items-center gap-1.5">
                        <Maximize2 size={12} /> Image Settings
                    </span>
                    <button type="button" onClick={onClose} className="text-[var(--rte-muted)] hover:text-[var(--rte-fg)] transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Alignment */}
                <div className="mb-3">
                    <p className="text-[10px] font-semibold text-[var(--rte-muted)] uppercase tracking-wider mb-1.5">Alignment</p>
                    <div className="flex gap-1.5">
                        <button type="button" onClick={() => applyAlign('left')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--rte-hover)] text-[var(--rte-fg)] hover:bg-[var(--rte-accent)]/15 hover:text-[var(--rte-accent)] transition-all">
                            <AlignLeft size={12} /> Left
                        </button>
                        <button type="button" onClick={() => applyAlign('center')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--rte-hover)] text-[var(--rte-fg)] hover:bg-[var(--rte-accent)]/15 hover:text-[var(--rte-accent)] transition-all">
                            <AlignCenter size={12} /> Center
                        </button>
                        <button type="button" onClick={() => applyAlign('right')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--rte-hover)] text-[var(--rte-fg)] hover:bg-[var(--rte-accent)]/15 hover:text-[var(--rte-accent)] transition-all">
                            <AlignRight size={12} /> Right
                        </button>
                    </div>
                </div>

                {/* Quick Sizes */}
                <div className="mb-3">
                    <p className="text-[10px] font-semibold text-[var(--rte-muted)] uppercase tracking-wider mb-1.5">Quick Size</p>
                    <div className="flex gap-1.5">
                        {[
                            { label: '25%', key: 'small' },
                            { label: '50%', key: 'medium' },
                            { label: '75%', key: 'large' },
                            { label: '100%', key: 'full' },
                        ].map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => applyPresetSize(p.key)}
                                className="flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--rte-hover)] text-[var(--rte-fg)] hover:bg-[var(--rte-accent)]/15 hover:text-[var(--rte-accent)] transition-all"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Size */}
                <div>
                    <p className="text-[10px] font-semibold text-[var(--rte-muted)] uppercase tracking-wider mb-1.5">Custom Size</p>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="text-[10px] text-[var(--rte-muted)]">Width</label>
                            <input
                                type="text"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                placeholder="e.g. 300px, 50%"
                                className="w-full mt-0.5 px-2.5 py-1.5 bg-[var(--rte-hover)] border border-[var(--rte-border)] rounded-lg text-[11px] text-[var(--rte-fg)] outline-none focus:border-[var(--rte-accent)]/30 transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-[var(--rte-muted)]">Height</label>
                            <input
                                type="text"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="auto"
                                className="w-full mt-0.5 px-2.5 py-1.5 bg-[var(--rte-hover)] border border-[var(--rte-border)] rounded-lg text-[11px] text-[var(--rte-fg)] outline-none focus:border-[var(--rte-accent)]/30 transition-all"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={applySize}
                            className="px-3 py-1.5 bg-[var(--rte-accent)] text-white text-[11px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Delete image */}
                <button
                    type="button"
                    onClick={() => {
                        img.remove();
                        onClose();
                        onUpdate();
                    }}
                    className="mt-3 w-full py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    Remove Image
                </button>
            </div>
        </div>
    );
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'เริ่มเขียนเนื้อหา...',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

    // Set initial content once
    useEffect(() => {
        if (editorRef.current && value && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    // Click handler for images inside editor
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                e.preventDefault();
                e.stopPropagation();
                setSelectedImage(target as HTMLImageElement);
                // Add visual selection
                editor.querySelectorAll('img').forEach((img) => {
                    img.style.outline = 'none';
                    img.style.outlineOffset = '0';
                });
                (target as HTMLImageElement).style.outline = '2px solid var(--rte-accent)';
                (target as HTMLImageElement).style.outlineOffset = '3px';
            } else {
                // Deselect
                if (selectedImage) {
                    editor.querySelectorAll('img').forEach((img) => {
                        img.style.outline = 'none';
                    });
                    setSelectedImage(null);
                }
            }
        };

        editor.addEventListener('click', handleClick);
        return () => editor.removeEventListener('click', handleClick);
    }, [selectedImage]);

    // Track active formats
    const updateActiveFormats = useCallback(() => {
        const formats = new Set<string>();
        if (document.queryCommandState('bold')) formats.add('bold');
        if (document.queryCommandState('italic')) formats.add('italic');
        if (document.queryCommandState('underline')) formats.add('underline');
        if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
        if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList');
        if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList');
        if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft');
        if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
        if (document.queryCommandState('justifyRight')) formats.add('justifyRight');
        setActiveFormats(formats);
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        updateActiveFormats();
    }, [onChange, updateActiveFormats]);

    const execCmd = useCallback(
        (command: string, val?: string) => {
            editorRef.current?.focus();
            document.execCommand(command, false, val);
            handleInput();
        },
        [handleInput],
    );

    const handleFormatBlock = useCallback(
        (tag: string) => {
            editorRef.current?.focus();
            document.execCommand('formatBlock', false, tag);
            handleInput();
        },
        [handleInput],
    );

    const handleInsertLink = useCallback(() => {
        const url = prompt('Enter URL:');
        if (url) {
            execCmd('createLink', url);
        }
    }, [execCmd]);

    const handleInsertImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const insertImageHtml = useCallback(
        (src: string, alt: string) => {
            editorRef.current?.focus();
            document.execCommand(
                'insertHTML',
                false,
                `<img src="${src}" alt="${alt}" style="max-width:100%;width:100%;height:auto;border-radius:12px;margin:12px 0;cursor:pointer;" />`,
            );
            handleInput();
        },
        [handleInput],
    );

    const handleImageUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const compressed = await compressImage(file, { maxSize: 1920, quality: 0.8, outputType: 'base64' }) as string;
                insertImageHtml(compressed, file.name);
            } catch {
                // fallback ถ้า compress ไม่ได้
                const reader = new FileReader();
                reader.onload = (event) => {
                    insertImageHtml(event.target?.result as string, file.name);
                };
                reader.readAsDataURL(file);
            }
            e.target.value = '';
        },
        [insertImageHtml],
    );

    const handleInsertImageUrl = useCallback(() => {
        const url = prompt('Enter image URL:');
        if (url) {
            insertImageHtml(url, 'image');
        }
    }, [insertImageHtml]);

    const handleKeyUp = useCallback(() => {
        updateActiveFormats();
    }, [updateActiveFormats]);

    const handleMouseUp = useCallback(() => {
        updateActiveFormats();
    }, [updateActiveFormats]);

    return (
        <div
            className={`
        rounded-2xl border transition-all duration-300 overflow-hidden
        ${isFocused
                    ? 'border-[var(--rte-accent)]/30 shadow-lg shadow-[var(--rte-accent)]/5'
                    : 'border-[var(--rte-border)] hover:border-[var(--rte-border-hover)]'
                }
        bg-[var(--rte-bg)]
      `}
            style={{
                '--rte-accent': '#C5A059',
                '--rte-bg': 'var(--admin-card)',
                '--rte-toolbar-bg': 'var(--admin-card-alt)',
                '--rte-fg': 'var(--admin-fg)',
                '--rte-muted': 'var(--admin-muted)',
                '--rte-border': 'var(--admin-border)',
                '--rte-border-hover': 'var(--admin-border-hover)',
                '--rte-hover': 'var(--admin-hover)',
            } as React.CSSProperties}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-[var(--rte-border)] bg-[var(--rte-toolbar-bg)]">
                {/* Text type */}
                <ToolbarButton icon={Type} label="Paragraph" onClick={() => handleFormatBlock('p')} />
                <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => handleFormatBlock('h1')} />
                <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => handleFormatBlock('h2')} />
                <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => handleFormatBlock('h3')} />

                <ToolbarSep />

                {/* Basic formatting */}
                <ToolbarButton icon={Bold} label="Bold (Ctrl+B)" onClick={() => execCmd('bold')} active={activeFormats.has('bold')} />
                <ToolbarButton icon={Italic} label="Italic (Ctrl+I)" onClick={() => execCmd('italic')} active={activeFormats.has('italic')} />
                <ToolbarButton icon={Underline} label="Underline (Ctrl+U)" onClick={() => execCmd('underline')} active={activeFormats.has('underline')} />
                <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => execCmd('strikeThrough')} active={activeFormats.has('strikeThrough')} />

                <ToolbarSep />

                {/* Lists */}
                <ToolbarButton icon={List} label="Bullet List" onClick={() => execCmd('insertUnorderedList')} active={activeFormats.has('insertUnorderedList')} />
                <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => execCmd('insertOrderedList')} active={activeFormats.has('insertOrderedList')} />

                <ToolbarSep />

                {/* Alignment */}
                <ToolbarButton icon={AlignLeft} label="Align Left" onClick={() => execCmd('justifyLeft')} active={activeFormats.has('justifyLeft')} />
                <ToolbarButton icon={AlignCenter} label="Align Center" onClick={() => execCmd('justifyCenter')} active={activeFormats.has('justifyCenter')} />
                <ToolbarButton icon={AlignRight} label="Align Right" onClick={() => execCmd('justifyRight')} active={activeFormats.has('justifyRight')} />

                <ToolbarSep />

                {/* Block elements */}
                <ToolbarButton icon={Quote} label="Blockquote" onClick={() => handleFormatBlock('blockquote')} />
                <ToolbarButton icon={Code} label="Code Block" onClick={() => handleFormatBlock('pre')} />
                <ToolbarButton icon={Minus} label="Horizontal Rule" onClick={() => execCmd('insertHorizontalRule')} />

                <ToolbarSep />

                {/* Media & link */}
                <ToolbarButton icon={LinkIcon} label="Insert Link" onClick={handleInsertLink} />
                <ToolbarButton icon={ImageIcon} label="Upload Image" onClick={handleInsertImage} />
                <ToolbarButton icon={Palette} label="Image from URL" onClick={handleInsertImageUrl} />

                <ToolbarSep />

                {/* Undo / Redo / Clear */}
                <ToolbarButton icon={Undo} label="Undo (Ctrl+Z)" onClick={() => execCmd('undo')} />
                <ToolbarButton icon={Redo} label="Redo (Ctrl+Y)" onClick={() => execCmd('redo')} />
                <ToolbarButton icon={RemoveFormatting} label="Clear Formatting" onClick={() => execCmd('removeFormat')} />
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            {/* Editable Area */}
            <div className="relative">
                {/* Image toolbar popup */}
                {selectedImage && (
                    <ImageToolbar
                        img={selectedImage}
                        onClose={() => {
                            if (selectedImage) {
                                selectedImage.style.outline = 'none';
                            }
                            setSelectedImage(null);
                        }}
                        onUpdate={handleInput}
                    />
                )}

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyUp={handleKeyUp}
                    onMouseUp={handleMouseUp}
                    data-placeholder={placeholder}
                    className={`
            min-h-[400px] max-h-[700px] overflow-y-auto p-5 md:p-6
            text-sm leading-relaxed outline-none
            text-[var(--admin-fg)]
            [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[var(--admin-muted)] [&:empty]:before:pointer-events-none
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
            [&_p]:my-2
            [&_blockquote]:border-l-3 [&_blockquote]:border-[#C5A059]/40 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:opacity-70 [&_blockquote]:my-3
            [&_pre]:bg-black/20 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:text-emerald-400 [&_pre]:my-3 [&_pre]:overflow-x-auto
            [&_a]:text-[#C5A059] [&_a]:underline [&_a]:underline-offset-2
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
            [&_li]:my-1
            [&_img]:rounded-xl [&_img]:my-3 [&_img]:shadow-lg [&_img]:cursor-pointer [&_img]:transition-[outline] [&_img]:duration-200
            [&_hr]:border-[var(--admin-border)] [&_hr]:my-4
          `}
                />
            </div>

            <style jsx>{`
        @keyframes img-toolbar-enter {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-img-toolbar) {
          animation: img-toolbar-enter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
        </div>
    );
}
