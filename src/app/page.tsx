'use client';

import { useState, useRef, useCallback } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { Send, StopCircle } from 'lucide-react';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

interface Chat {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  lastUpdated: number;
}

const WELCOME_TITLE = 'محادثة جديدة';

export default function Home() {
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [model, setModel] = useState('gpt-4o-mini');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = activeChatId ? chats[activeChatId] : null;
  const activeMessages = activeChat?.messages || [];

  // --- دوال إدارة المحادثات ---
  const handleNewChat = useCallback(() => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const newChat: Chat = {
      id,
      title: WELCOME_TITLE,
      model,
      messages: [],
      lastUpdated: Date.now(),
    };
    setChats((prev) => ({ ...prev, [id]: newChat }));
    setActiveChatId(id);
    setModel('gpt-4o-mini');
    inputRef.current?.focus();
  }, [model]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    if (chats[id]) setModel(chats[id].model || 'gpt-4o-mini');
  }, [chats]);

  const handleDeleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    if (activeChatId === id) {
      const remaining = Object.keys(chats).filter(k => k !== id);
      setActiveChatId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  }, [activeChatId, chats]);

  const handleRenameChat = useCallback((id: string, title: string) => {
    setChats((prev) => ({
      ...prev,
      [id]: { ...prev[id], title },
    }));
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // --- إرسال الرسائل (مؤقت: رد وهمي) ---
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isGenerating) return;

    if (!activeChatId) {
      handleNewChat();
      return;
    }

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setChats((prev) => ({
      ...prev,
      [activeChatId!]: {
        ...prev[activeChatId!],
        messages: [...(prev[activeChatId!]?.messages || []), userMsg],
        lastUpdated: Date.now(),
        title: prev[activeChatId!]?.title === WELCOME_TITLE ? text.slice(0, 30) + (text.length > 30 ? '…' : '') : prev[activeChatId!]?.title,
      },
    }));
    setInputValue('');

    // محاكاة رد وهمي (سنستبدله لاحقاً بـ API)
    setIsGenerating(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        content: '👋 هذا رد تجريبي من ShadMini AI! سنقوم بتوصيل الذكاء الاصطناعي الحقيقي في الخطوة التالية.',
        createdAt: new Date().toISOString(),
      };
      setChats((prev) => ({
        ...prev,
        [activeChatId!]: {
          ...prev[activeChatId!],
          messages: [...(prev[activeChatId!]?.messages || []), aiMsg],
          lastUpdated: Date.now(),
        },
      }));
      setIsGenerating(false);
    }, 1500);
  }, [inputValue, isGenerating, activeChatId, handleNewChat]);

  const handleStop = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const handleCopy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('تم النسخ!');
    } catch {}
  }, []);

  const handleRegenerate = useCallback(() => {
    // سنضيفه لاحقاً
  }, []);

  const chatsList = Object.values(chats).map((c) => ({
    id: c.id,
    title: c.title,
    lastUpdated: c.lastUpdated,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121] dark:bg-[#212121]">
      <ChatSidebar
        chats={chatsList}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      <main className="flex h-full flex-1 flex-col overflow-hidden bg-[#212121]">
        <header className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm font-medium text-white focus:outline-none"
          >
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="deepseek-r1">DeepSeek R1</option>
            <option value="Llama-3.3-70B-Instruct">Llama 3.3 70B</option>
            <option value="Mistral-Large-2411">Mistral Large</option>
            <option value="Phi-4">Phi-4</option>
            <option value="Codestral-2501">Codestral</option>
          </select>
          <span className="text-sm text-gray-500">{activeChat?.title || WELCOME_TITLE}</span>
        </header>
        <div className="flex-1 overflow-y-auto">
          <ChatWindow
            messages={activeMessages}
            isGenerating={isGenerating}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
          />
        </div>
        <div className="border-t border-gray-700 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-gray-600 bg-[#2f2f2f] px-4 py-3">
            <textarea
              ref={inputRef}
              id="message-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            />
            <div className="flex items-center gap-2">
              {isGenerating && (
                <button
                  onClick={handleStop}
                  id="stop-btn"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-500 text-gray-400 transition hover:bg-gray-700"
                >
                  <StopCircle size={18} />
                </button>
              )}
              <button
                onClick={handleSend}
                id="send-btn"
                disabled={isGenerating || !inputValue.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:opacity-80 disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            اضغط Enter للإرسال، Shift+Enter لسطر جديد
          </p>
        </div>
      </main>
    </div>
  );
}