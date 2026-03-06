/* ============================================
   BRUTSTeamPad — Document Editor
   TipTap + Yjs collaborative editor core
   ============================================ */
'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { motion } from 'framer-motion';

import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { LiveUserBar } from '@/components/cursors/LiveUserBar';
import { useRealtime } from '@/hooks/useRealtime';
import { useAutosave } from '@/hooks/useAutosave';
import {
    useAuthStore,
    useDocumentStore,
    useEditorStateStore,
} from '@/lib/store';
import { uploadImage } from '@/lib/supabase-api';

export function DocumentEditor() {
    const { user, cursorColor, workspace } = useAuthStore();
    const { activeDocument } = useDocumentStore();
    const { setWordCount, setCharacterCount, setEditing } =
        useEditorStateStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const documentId = activeDocument?.id || null;

    // Realtime collaboration via Yjs
    const { ydoc, provider } = useRealtime({
        documentId,
        enabled: !!documentId,
    });

    // Autosave to database
    const { updateContent, forceSave } = useAutosave({
        documentId,
        interval: 10000,
        enabled: !!documentId,
    });

    // TipTap editor extensions
    const extensions = useMemo(() => {
        const exts: any[] = [
            StarterKit.configure({
                history: false, // Disable — Yjs handles undo/redo
                codeBlock: {
                    HTMLAttributes: {
                        class: 'language-plaintext',
                    },
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder: 'Start writing something amazing...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
                allowBase64: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
        ];

        // Add collaboration extensions when Yjs is connected
        if (ydoc && provider) {
            exts.push(
                Collaboration.configure({
                    document: ydoc,
                }),
                CollaborationCursor.configure({
                    provider: provider,
                    user: {
                        name: user?.username || user?.email?.split('@')[0] || 'Anonymous',
                        color: cursorColor,
                    },
                })
            );
        }

        return exts;
    }, [ydoc, provider, user, cursorColor]);

    // Initialize TipTap editor
    const editor = useEditor(
        {
            extensions,
            editorProps: {
                attributes: {
                    class: 'tiptap-editor',
                    spellcheck: 'true',
                },
            },
            onUpdate: ({ editor }) => {
                const html = editor.getHTML();
                const text = editor.getText();

                // Update autosave
                updateContent(html);

                // Update word/char counts
                const words = text
                    .split(/\s+/)
                    .filter((w) => w.length > 0).length;
                setWordCount(words);
                setCharacterCount(text.length);
            },
            onFocus: () => setEditing(true),
            onBlur: () => setEditing(false),
        },
        [extensions]
    );

    // Handle image upload
    const handleImageUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor || !workspace?.id || !documentId) return;

            // Validate file
            const validTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
            if (!validTypes.includes(file.type)) {
                alert('Only JPEG, PNG, GIF, and WebP images are supported.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be smaller than 5MB.');
                return;
            }

            try {
                const url = await uploadImage(workspace.id, documentId, file);
                editor.chain().focus().setImage({ src: url }).run();
            } catch (error) {
                console.error('Image upload failed:', error);
                alert('Failed to upload image. Please try again.');
            }

            // Reset input
            e.target.value = '';
        },
        [editor, workspace?.id, documentId]
    );

    // Keyboard shortcut: Ctrl+S to force save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                forceSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [forceSave]);

    // No document selected state
    if (!activeDocument) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-20 h-20 rounded-3xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center mx-auto mb-6">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="text-white/10"
                        >
                            <path
                                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
                                strokeWidth="1.5"
                            />
                            <path d="M14 2v6h6" strokeWidth="1.5" />
                            <path d="M16 13H8" strokeWidth="1.5" />
                            <path d="M16 17H8" strokeWidth="1.5" />
                            <path d="M10 9H8" strokeWidth="1.5" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white/30 mb-2">
                        Select a document
                    </h3>
                    <p className="text-sm text-white/15 max-w-xs">
                        Choose a document from the sidebar or create a new one to start
                        collaborating
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Document title */}
            <div className="px-8 pt-6 pb-2">
                <h1 className="text-2xl font-bold text-white/90 truncate">
                    {activeDocument.title}
                </h1>
            </div>

            {/* Live user bar */}
            <LiveUserBar />

            {/* Toolbar */}
            <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />

            {/* Editor area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Hidden file input for image uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload-input"
            />

            {/* Bottom status bar */}
            <motion.div
                className="flex items-center justify-between px-6 py-1.5 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-[11px] text-white/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-4">
                    <span>
                        {useEditorStateStore.getState().wordCount} words
                    </span>
                    <span>
                        {useEditorStateStore.getState().characterCount} characters
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span>Autosave: 10s</span>
                    <span className="text-neon-green/50">● Connected</span>
                </div>
            </motion.div>
        </div>
    );
}

export default DocumentEditor;
