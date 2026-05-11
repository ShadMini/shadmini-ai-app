'use client';

import { Trash2, MessageSquare, Sparkles, Moon, Sun } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  lastUpdated?: number;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  darkMode,
  onToggleDarkMode,
}: ChatSidebarProps) {
  const sortedChats = [...chats].sort(
    (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0)
  );

  return (
    <aside className="flex h-full w-[280px] flex-col border-r border-gray-700 bg-[#171717]">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <span className="text-lg font-bold text-white">ShadMini AI</span>
        <button
          onClick={onToggleDarkMode}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 text-gray-400 hover:bg-gray-800"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Sparkles size={16} className="text-[#10a37f]" />
          <span>محادثة جديدة</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          المحادثات السابقة
        </p>
        {sortedChats.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-500">لا توجد محادثات</p>
        ) : (
          <div className="space-y-0.5">
            {sortedChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                  chat.id === activeChatId
                    ? 'bg-[#343541] text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => onSelectChat(chat.id)}
                onDoubleClick={() => {
                  const newTitle = prompt('اسم جديد:', chat.title);
                  if (newTitle && newTitle.trim()) {
                    onRenameChat(chat.id, newTitle.trim());
                  }
                }}
              >
                <MessageSquare size={14} className="flex-shrink-0" />
                <span className="flex-1 truncate">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('حذف المحادثة؟')) onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}