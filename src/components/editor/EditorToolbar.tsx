/* ============================================
   BRUTSTeamPad — Editor Toolbar
   TipTap rich-text formatting controls
   ============================================ */
'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Code,
    Table as TableIcon,
    Image as ImageIcon,
    Minus,
    Undo,
    Redo,
    Quote,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
    editor: Editor | null;
    onImageUpload?: () => void;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ReactNode;
    tooltip: string;
    disabled?: boolean;
}

function ToolbarButton({
    onClick,
    isActive = false,
    icon,
    tooltip,
    disabled = false,
}: ToolbarButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`relative p-2 rounded-lg transition-all duration-200 group
        ${isActive
                    ? 'bg-brand-600/25 text-brand-300 border border-brand-500/30'
                    : 'text-white/50 hover:text-white/80 hover:bg-[rgba(255,255,255,0.06)] border border-transparent'
                }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            title={tooltip}
        >
            {icon}
        </motion.button>
    );
}

function Divider() {
    return <div className="w-px h-6 bg-white/10 mx-1" />;
}

export const EditorToolbar = memo(function EditorToolbar({
    editor,
    onImageUpload,
}: EditorToolbarProps) {
    if (!editor) return null;

    return (
        <motion.div
            className="flex items-center gap-0.5 px-3 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-x-auto"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* History */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                icon={<Undo size={16} />}
                tooltip="Undo (Ctrl+Z)"
                disabled={!editor.can().undo()}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                icon={<Redo size={16} />}
                tooltip="Redo (Ctrl+Y)"
                disabled={!editor.can().redo()}
            />

            <Divider />

            {/* Text formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={<Bold size={16} />}
                tooltip="Bold (Ctrl+B)"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={<Italic size={16} />}
                tooltip="Italic (Ctrl+I)"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                icon={<UnderlineIcon size={16} />}
                tooltip="Underline (Ctrl+U)"
            />

            <Divider />

            {/* Headings */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive('heading', { level: 1 })}
                icon={<Heading1 size={16} />}
                tooltip="Heading 1"
            />
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive('heading', { level: 2 })}
                icon={<Heading2 size={16} />}
                tooltip="Heading 2"
            />
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                isActive={editor.isActive('heading', { level: 3 })}
                icon={<Heading3 size={16} />}
                tooltip="Heading 3"
            />

            <Divider />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                icon={<List size={16} />}
                tooltip="Bullet List"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                icon={<ListOrdered size={16} />}
                tooltip="Numbered List"
            />

            <Divider />

            {/* Block elements */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                icon={<Code size={16} />}
                tooltip="Code Block"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                icon={<Quote size={16} />}
                tooltip="Blockquote"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                icon={<Minus size={16} />}
                tooltip="Horizontal Rule"
            />

            <Divider />

            {/* Table */}
            <ToolbarButton
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run()
                }
                icon={<TableIcon size={16} />}
                tooltip="Insert Table"
            />

            {/* Image */}
            {onImageUpload && (
                <ToolbarButton
                    onClick={onImageUpload}
                    icon={<ImageIcon size={16} />}
                    tooltip="Upload Image"
                />
            )}
        </motion.div>
    );
});

export default EditorToolbar;
