/* ============================================
   BRUTSTeamPad — Document Management Hook
   CRUD operations for workspace documents
   ============================================ */
'use client';

import { useCallback, useEffect } from 'react';
import {
    getDocuments,
    getDocument,
    createDocument,
    deleteDocument,
    renameDocument,
} from '@/lib/supabase-api';
import { useAuthStore, useDocumentStore } from '@/lib/store';

/**
 * Hook for managing workspace documents.
 * Provides CRUD operations and auto-fetches on mount.
 */
export function useDocuments() {
    const { workspace } = useAuthStore();
    const {
        documents,
        activeDocument,
        isLoading,
        setDocuments,
        addDocument,
        removeDocument,
        updateDocumentInList,
        setActiveDocument,
        setLoading,
    } = useDocumentStore();

    // Fetch all documents for current workspace
    const fetchDocuments = useCallback(async () => {
        if (!workspace?.id) return;

        try {
            setLoading(true);
            const docs = await getDocuments(workspace.id);
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    }, [workspace?.id, setDocuments, setLoading]);

    // Auto-fetch on workspace change
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Create a new document
    const handleCreate = useCallback(
        async (title?: string) => {
            if (!workspace?.id) return;
            try {
                const doc = await createDocument(workspace.id, title);
                addDocument(doc);
                setActiveDocument(doc);
                return doc;
            } catch (error) {
                console.error('Failed to create document:', error);
            }
        },
        [workspace?.id, addDocument, setActiveDocument]
    );

    // Open a document
    const handleOpen = useCallback(
        async (documentId: string) => {
            try {
                const doc = await getDocument(documentId);
                if (doc) {
                    setActiveDocument(doc);
                }
            } catch (error) {
                console.error('Failed to open document:', error);
            }
        },
        [setActiveDocument]
    );

    // Delete a document
    const handleDelete = useCallback(
        async (documentId: string) => {
            try {
                await deleteDocument(documentId);
                removeDocument(documentId);
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        },
        [removeDocument]
    );

    // Rename a document
    const handleRename = useCallback(
        async (documentId: string, newTitle: string) => {
            try {
                await renameDocument(documentId, newTitle);
                updateDocumentInList(documentId, { title: newTitle });
            } catch (error) {
                console.error('Failed to rename document:', error);
            }
        },
        [updateDocumentInList]
    );

    return {
        documents,
        activeDocument,
        isLoading,
        fetchDocuments,
        createDocument: handleCreate,
        openDocument: handleOpen,
        deleteDocument: handleDelete,
        renameDocument: handleRename,
    };
}
