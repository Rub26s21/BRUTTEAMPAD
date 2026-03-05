/* ============================================
   BRUTSTeamPad — Workspace Sidebar
   Document list & management
   ============================================ */
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Trash2,
    Pencil,
    Search,
    X,
    Check,
    MoreHorizontal,
    FolderOpen,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentStore } from '@/lib/store';
import type { Document } from '@/lib/types';

export function WorkspaceSidebar() {
    const {
        documents,
        activeDocument,
        isLoading,
        createDocument,
        openDocument,
        deleteDocument,
        renameDocument,
    } = useDocuments();

    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    const filteredDocs = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = useCallback(async () => {
        await createDocument('Untitled Document');
    }, [createDocument]);

    const handleStartRename = useCallback((doc: Document) => {
        setEditingId(doc.id);
        setEditTitle(doc.title);
        setMenuOpenId(null);
    }, []);

    const handleSaveRename = useCallback(
        async (docId: string) => {
            if (editTitle.trim()) {
                await renameDocument(docId, editTitle.trim());
            }
            setEditingId(null);
        },
        [editTitle, renameDocument]
    );

    const handleDelete = useCallback(
        async (docId: string) => {
            setMenuOpenId(null);
            await deleteDocument(docId);
        },
        [deleteDocument]
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FolderOpen size={16} className="text-brand-400" />
                        <h2 className="text-sm font-semibold text-white/80">Documents</h2>
                    </div>
                    <Button
                        variant="neon"
                        size="sm"
                        onClick={handleCreate}
                        icon={<Plus size={14} />}
                        id="create-document-btn"
                    >
                        New
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input pl-9 py-2 text-xs"
                        id="search-documents"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                {isLoading ? (
                    <div className="space-y-2 px-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="shimmer h-14 rounded-xl" />
                        ))}
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-3">
                            <FileText size={20} className="text-white/20" />
                        </div>
                        <p className="text-sm text-white/30 mb-1">
                            {searchQuery ? 'No documents found' : 'No documents yet'}
                        </p>
                        {!searchQuery && (
                            <p className="text-xs text-white/20">
                                Create your first document to get started
                            </p>
                        )}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredDocs.map((doc, index) => {
                            const isActive = activeDocument?.id === doc.id;
                            const isEditing = editingId === doc.id;

                            return (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all duration-200
                    ${isActive
                                            ? 'bg-brand-600/15 border border-brand-500/25'
                                            : 'hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
                                        }`}
                                    onClick={() => !isEditing && openDocument(doc.id)}
                                >
                                    {/* Document icon */}
                                    <FileText
                                        size={15}
                                        className={`flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-white/25'
                                            }`}
                                    />

                                    {/* Title / Edit */}
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveRename(doc.id);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                    className="bg-transparent border-b border-brand-400/50 text-sm text-white outline-none w-full py-0.5"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSaveRename(doc.id);
                                                    }}
                                                    className="text-neon-green hover:text-neon-green/80"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <p
                                                    className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-white/70'
                                                        }`}
                                                >
                                                    {doc.title}
                                                </p>
                                                <p className="text-[10px] text-white/25 mt-0.5">
                                                    {formatDate(doc.updated_at)}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Context menu trigger */}
                                    {!isEditing && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuOpenId(
                                                        menuOpenId === doc.id ? null : doc.id
                                                    );
                                                }}
                                                className="p-1 rounded-lg hover:bg-[rgba(255,255,255,0.1)] text-white/40 hover:text-white/70"
                                            >
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Context menu */}
                                    <AnimatePresence>
                                        {menuOpenId === doc.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                className="absolute right-2 top-full mt-1 z-50 glass-panel-sm py-1 min-w-[140px]"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => handleStartRename(doc)}
                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                                                >
                                                    <Pencil size={12} />
                                                    Rename
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

export default WorkspaceSidebar;
