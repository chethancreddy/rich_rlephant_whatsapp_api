'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  CheckCheck,
  Clock,
  Send,
  Lock,
  User,
  Tag,
  Paperclip,
  MoreVertical,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  PlusCircle,
  Mic,
  MicOff,
  Square,
  Trash2,
  Play,
  Pause,
  Volume2,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  MailOpen,
  Filter,
  Users,
  Archive,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Forward,
  Building2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateServiceWindow } from '@/lib/service-window';
import { getSupportedAudioMimeType, validateWhatsAppAudio } from '@/lib/audio-recorder';
import {
  InboxView,
  DepartmentName,
  CANNED_RESPONSES,
  filterInboxConversations,
  bulkUpdateReadStatus,
} from '@/lib/services/inbox-service';

interface ConversationItem {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  assignedTo: string;
  team: DepartmentName;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  isCustomerLastInbound: boolean;
  tags: string[];
  isArchived?: boolean;
  isGroup?: boolean;
}

interface MessageItem {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent';
  type: 'text' | 'voice' | 'template';
  text?: string;
  audioUrl?: string;
  audioDuration?: number; // duration in seconds
  time: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  errorMessage?: string;
}

const MOCK_CONVERSATIONS: ConversationItem[] = [];

const INITIAL_MESSAGES: Record<string, MessageItem[]> = {};

type VoiceState = 'idle' | 'recording' | 'paused' | 'preview' | 'sending';

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ConversationItem | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>({});
  const [activeTab, setActiveTab] = useState<'messages' | 'notes'>('messages');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mobile View Switcher: 'list' (shows conversation sidebar) or 'chat' (shows active thread canvas)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Multi-View Filter States (Phase 5)
  const [inboxView, setInboxView] = useState<InboxView>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Popovers
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDept, setTransferDept] = useState<DepartmentName>('Sales Desk');
  const [transferAgent, setTransferAgent] = useState('Sarah Jenkins');
  const [transferNote, setTransferNote] = useState('');

  // Voice recording state machine
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [previewAudioBlob, setPreviewAudioBlob] = useState<Blob | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);

  // In-thread playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const threadAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [notes, setNotes] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: 'n1',
      author: 'Chethan Reddy',
      text: 'Customer requested delivery before 3:00 PM if possible. Driver notified.',
      time: 'Today at 11:50 AM',
    },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Fetch real conversations from Neon Serverless PostgreSQL with auto-polling
  useEffect(() => {
    const loadConversations = () => {
      fetch('/api/conversations')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.conversations)) {
            setConversations(data.conversations);
            setSelectedChat((curr) => {
              if (!curr && data.conversations.length > 0) {
                const first = data.conversations[0];
                if (first.unread > 0) {
                  fetch(`/api/conversations/${first.id}/read`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ markRead: true }),
                  }).catch(() => {});
                  return { ...first, unread: 0 };
                }
                return first;
              }
              if (curr) {
                const updated = data.conversations.find((c: any) => c.id === curr.id);
                return updated ? { ...curr, ...updated } : curr;
              }
              return curr;
            });
          }
        })
        .catch(() => {});
    };

    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real message thread for selected conversation with auto-polling
  useEffect(() => {
    if (!selectedChat?.id) return;

    const loadMessages = () => {
      fetch(`/api/conversations/${selectedChat.id}/messages`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.messages)) {
            setMessagesMap((prev) => ({
              ...prev,
              [selectedChat.id]: data.messages,
            }));
          }
        })
        .catch(() => {});
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedChat?.id]);

  const hasCollision = false;
  const windowStatus = calculateServiceWindow(selectedChat?.lastMessageAt);
  const currentMessages = selectedChat ? (messagesMap[selectedChat.id] || []) : [];

  // Filter conversations using Phase 5 Multi-View rules
  const filteredConversations = filterInboxConversations(conversations, {
    view: inboxView,
    currentAgentName: 'Chethan Reddy',
    currentDepartment: 'Customer Support',
    departmentFilter,
    searchQuery,
  });

  const unreadTotal = conversations.filter((c) => c.unread > 0 && !c.isArchived).length;

  const markConversationAsReadInDb = (id: string, markRead: boolean = true) => {
    fetch(`/api/conversations/${id}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markRead }),
    }).catch(() => {});
  };

  const handleSelectChat = (chat: ConversationItem) => {
    if (chat.unread > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
      );
      markConversationAsReadInDb(chat.id, true);
    }
    setSelectedChat({ ...chat, unread: 0 });
    setMobileView('chat');
    handleDiscardRecording();
  };

  const handleToggleReadStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = conversations.find((c) => c.id === id);
    const nextUnread = target && target.unread > 0 ? 0 : 1;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (selectedChat && selectedChat.id === id) {
            setSelectedChat((curr) => curr ? ({ ...curr, unread: nextUnread }) : null);
          }
          return { ...c, unread: nextUnread };
        }
        return c;
      })
    );
    markConversationAsReadInDb(id, nextUnread === 0);
  };

  const handleToggleCurrentChatRead = () => {
    if (!selectedChat) return;
    const isCurrentlyUnread = selectedChat.unread > 0;
    const nextUnread = isCurrentlyUnread ? 0 : 1;
    const currentId = selectedChat.id;

    setConversations((prev) =>
      prev.map((c) => (c.id === currentId ? { ...c, unread: nextUnread } : c))
    );
    setSelectedChat((curr) => curr ? ({ ...curr, unread: nextUnread }) : null);
    markConversationAsReadInDb(currentId, nextUnread === 0);
  };

  // Bulk Operations
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredConversations.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkRead = (markRead: boolean) => {
    if (selectedIds.length === 0) return;
    const targetIds = [...selectedIds];
    setConversations((prev) => bulkUpdateReadStatus(prev, targetIds, markRead));
    if (selectedChat && targetIds.includes(selectedChat.id)) {
      setSelectedChat((curr) => curr ? ({ ...curr, unread: markRead ? 0 : 1 }) : null);
    }
    setSelectedIds([]);

    fetch('/api/conversations/bulk-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationIds: targetIds, markRead }),
    }).catch(() => {});
  };

  const handleBulkArchive = () => {
    setConversations((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, isArchived: true } : c))
    );
    setSelectedIds([]);
  };

  // Transfer / Reassignment
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? { ...c, team: transferDept, assignedTo: transferAgent }
          : c
      )
    );
    setSelectedChat((prev) => prev ? ({
      ...prev,
      team: transferDept,
      assignedTo: transferAgent,
    }) : null);

    if (transferNote.trim()) {
      setNotes((prev) => [
        ...prev,
        {
          id: `n_${Date.now()}`,
          author: 'Chethan Reddy',
          text: `[Triage Transfer] Handed over to ${transferDept} (${transferAgent}): ${transferNote.trim()}`,
          time: 'Just now',
        },
      ]);
      setTransferNote('');
    }

    setShowTransferModal(false);
  };

  // Canned response selection
  const handleSelectCanned = (snippet: string) => {
    setReplyText((prev) => (prev ? `${prev} ${snippet}` : snippet));
    setShowCannedModal(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (previewAudioElementRef.current) previewAudioElementRef.current.pause();
      if (threadAudioPlayerRef.current) threadAudioPlayerRef.current.pause();
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
    };
  }, [previewAudioUrl]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Voice Recording handlers
  const handleStartRecording = async () => {
    if (!windowStatus.isActive) {
      alert('Policy Restriction: Free-form voice notes can only be sent within the 24-hour customer service window.');
      return;
    }

    setVoiceState('recording');
    setRecordingSeconds(0);
    setPreviewAudioBlob(null);
    setPreviewAudioUrl(null);
    audioChunksRef.current = [];

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        let recorder: any = null;
        try {
          const OpusMediaRecorder = (await import('opus-media-recorder')).default;
          const workerOptions = {
            OggOpusEncoderWasmPath: '/opus/OggOpusEncoder.wasm',
            WebMOpusEncoderWasmPath: '/opus/WebMOpusEncoder.wasm',
            encoderWorkerFactory: () => new Worker('/opus/encoderWorker.umd.js'),
          };
          recorder = new OpusMediaRecorder(stream, { mimeType: 'audio/ogg' }, workerOptions);
        } catch (polyErr) {
          console.warn('[OpusPolyfill Fallback]', polyErr);
          const mimeType = getSupportedAudioMimeType();
          recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        }

        recorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const finalMime = recorder.mimeType || 'audio/ogg';
          const blob = new Blob(audioChunksRef.current, { type: finalMime });
          setPreviewAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewAudioUrl(url);
          setVoiceState('preview');
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
      }
    } catch {
      // simulated recording
    }
  };

  const handlePauseRecording = () => {
    if (voiceState !== 'recording') return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.pause();
    setVoiceState('paused');
  };

  const handleResumeRecording = () => {
    if (voiceState !== 'paused') return;
    timerIntervalRef.current = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
    if (mediaRecorderRef.current?.state === 'paused') mediaRecorderRef.current.resume();
    setVoiceState('recording');
  };

  const handleFinishRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    } else {
      const syntheticBlob = new Blob(['RIFF....WAVEfmt '], { type: 'audio/ogg; codecs=opus' });
      setPreviewAudioBlob(syntheticBlob);
      const url = URL.createObjectURL(syntheticBlob);
      setPreviewAudioUrl(url);
      setVoiceState('preview');
    }
  };

  const handleDiscardRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
    if (previewAudioElementRef.current) previewAudioElementRef.current.pause();
    setIsPlayingPreview(false);
    setVoiceState('idle');
  };

  const handleTogglePreviewPlayback = () => {
    if (!previewAudioUrl) return;
    if (!previewAudioElementRef.current) {
      const audio = new Audio(previewAudioUrl);
      previewAudioElementRef.current = audio;
      audio.ontimeupdate = () => setPreviewCurrentTime(Math.floor(audio.currentTime));
      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewCurrentTime(0);
      };
    }
    if (isPlayingPreview) {
      previewAudioElementRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioElementRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!selectedChat || isSending) return;
    const duration = recordingSeconds || 5;

    const tempId = `m_${Date.now()}`;
    const newMsg: MessageItem = {
      id: tempId,
      conversationId: selectedChat.id,
      sender: 'agent',
      type: 'voice',
      audioUrl: previewAudioUrl || undefined,
      audioDuration: duration,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));

    setIsSending(true);

    try {
      let audioBase64 = '';
      if (previewAudioBlob) {
        audioBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(previewAudioBlob);
        });
      }

      const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'audio',
          audioBase64,
          mimeType: previewAudioBlob?.type || 'audio/ogg',
          duration,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === tempId ? { ...m, status: 'sent', id: data.message_id || m.id } : m
          ),
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedChat.id
              ? {
                  ...c,
                  lastMessage: '🎤 Voice Note',
                  lastMessageAt: new Date().toISOString(),
                  isCustomerLastInbound: false,
                }
              : c
          )
        );
      } else {
        alert(data.error || 'Failed to dispatch voice note.');
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === tempId ? { ...m, status: 'failed', errorMessage: data.error } : m
          ),
        }));
      }
    } catch (err: any) {
      console.error('[Send Voice Error]', err);
    } finally {
      setIsSending(false);
      handleDiscardRecording();
    }
  };

  const handleSendReply = async () => {
    if (!selectedChat || !replyText.trim() || isSending) return;

    const sentText = replyText.trim();
    setReplyText('');
    setIsSending(true);

    const tempId = `m_${Date.now()}`;
    const newMsg: MessageItem = {
      id: tempId,
      conversationId: selectedChat.id,
      sender: 'agent',
      type: 'text',
      text: sentText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));

    try {
      const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageBody: sentText }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === tempId ? { ...m, status: 'sent', id: data.message_id || m.id } : m
          ),
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedChat.id
              ? {
                  ...c,
                  lastMessage: sentText,
                  lastMessageAt: new Date().toISOString(),
                  isCustomerLastInbound: false,
                }
              : c
          )
        );
      } else {
        alert(data.error || 'Failed to dispatch reply message.');
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === tempId ? { ...m, status: 'failed', errorMessage: data.error } : m
          ),
        }));
      }
    } catch (err: any) {
      console.error('[Send Reply Error]', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setNotes([
      ...notes,
      {
        id: `n_${Date.now()}`,
        author: 'Chethan Reddy',
        text: newNoteText.trim(),
        time: 'Just now',
      },
    ]);
    setNewNoteText('');
  };

  const updateStatus = (newStatus: 'open' | 'pending' | 'resolved' | 'closed') => {
    if (!selectedChat) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedChat.id ? { ...c, status: newStatus } : c))
    );
    setSelectedChat((prev) => prev ? ({ ...prev, status: newStatus }) : null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white border-2 border-[#202020] rounded-[28px] overflow-hidden relative">
      {/* Column 1: Conversations List & Multi-View Navigation */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r-2 border-[#202020] flex flex-col shrink-0 bg-[#F9F6F1] transition-all ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header: Search & View Selector */}
        <div className="p-3.5 border-b-2 border-[#202020] bg-white space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-[#202020]/50" />
            <input
              type="text"
              placeholder="Search conversations, names, phones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4EFE7] border-2 border-[#202020] rounded-[16px] focus:outline-none focus:ring-2 focus:ring-[#72A4F2] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#202020]/40 hover:text-black text-xs font-black"
              >
                ✕
              </button>
            )}
          </div>

          {/* Primary View Selector Tabs (Phase 5) */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#F4EFE7] border-2 border-[#202020] rounded-[16px] text-[11px] font-bold">
            {[
              { id: 'all', label: 'All', count: conversations.filter((c) => !c.isArchived).length },
              { id: 'unread', label: 'Unread', count: unreadTotal, highlight: true },
              { id: 'assigned_to_me', label: 'Mine', count: conversations.filter((c) => c.assignedTo === 'Chethan Reddy').length },
              { id: 'unassigned', label: 'Triage', count: conversations.filter((c) => c.assignedTo === 'Unassigned' || c.assignedTo === 'Automated System').length },
            ].map((tab) => {
              const isSelected = inboxView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setInboxView(tab.id as InboxView)}
                  className={`py-1 rounded-[12px] flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-[#202020] text-white shadow-xs'
                      : 'text-[#202020]/70 hover:text-[#202020] hover:bg-white/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.1 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : tab.highlight && tab.count > 0
                        ? 'bg-[#72A4F2] text-[#202020] font-black'
                        : 'bg-[#D8D0C4] text-[#202020]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Views & Department Filter Row */}
          <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
            {/* Extended Views Dropdown */}
            <select
              value={inboxView}
              onChange={(e) => setInboxView(e.target.value as InboxView)}
              className="px-2 py-1 bg-[#F4EFE7] border-1.5 border-[#202020] rounded-[12px] text-[11px] font-bold focus:outline-none"
            >
              <option value="all">View: All Active</option>
              <option value="unread">View: Unread Only</option>
              <option value="read">View: Read Only</option>
              <option value="assigned_to_me">View: Assigned to Me</option>
              <option value="unassigned">View: Unassigned / Bot</option>
              <option value="my_team">View: My Team (Customer Support)</option>
              <option value="groups">View: Group Chats</option>
              <option value="archived">View: Archived</option>
              <option value="closed">View: Closed / Resolved</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2 py-1 bg-[#F4EFE7] border-1.5 border-[#202020] rounded-[12px] text-[11px] font-bold focus:outline-none max-w-[130px] truncate"
            >
              <option value="all">All Depts</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Sales Desk">Sales Desk</option>
              <option value="Compliance">Compliance</option>
              <option value="Technical Operations">Technical</option>
            </select>
          </div>

          {/* Master Select Checkbox & Active Bulk Operations Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-[#D8D0C4] text-[11px]">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#202020]/70 hover:text-black">
              <input
                type="checkbox"
                checked={
                  selectedIds.length > 0 &&
                  selectedIds.length === filteredConversations.length
                }
                onChange={handleToggleSelectAll}
                className="rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2] h-3.5 w-3.5"
              />
              <span>Select All ({filteredConversations.length})</span>
            </label>

            {selectedIds.length > 0 && (
              <span className="font-bold text-[#72A4F2] bg-[#202020] px-2 py-0.5 rounded-full text-[10px]">
                {selectedIds.length} Selected
              </span>
            )}
          </div>
        </div>

        {/* Floating Bulk Action Ribbon */}
        {selectedIds.length > 0 && (
          <div className="bg-[#BED0F7] border-b-2 border-[#202020] px-3.5 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-150">
            <span className="font-bold text-[#202020] text-[11px]">
              Bulk Actions ({selectedIds.length}):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleBulkMarkRead(true)}
                className="px-2 py-0.5 bg-white border border-[#202020] rounded-[10px] text-[10px] font-bold hover:bg-[#F4EFE7]"
                title="Mark all selected as read"
              >
                Mark Read
              </button>
              <button
                onClick={() => handleBulkMarkRead(false)}
                className="px-2 py-0.5 bg-white border border-[#202020] rounded-[10px] text-[10px] font-bold hover:bg-[#F4EFE7]"
                title="Mark all selected as unread"
              >
                Mark Unread
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-2 py-0.5 bg-white border border-[#202020] rounded-[10px] text-[10px] font-bold hover:bg-[#F4EFE7]"
                title="Archive selected conversations"
              >
                Archive
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="p-1 text-[#202020]/70 hover:text-black"
                title="Cancel selection"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#D8D0C4]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#202020]/60 space-y-1">
              <p className="font-bold text-sm">No conversations found</p>
              <p className="text-[11px]">
                No customer threads matching "{inboxView}" and selected filters.
              </p>
              <button
                onClick={() => {
                  setInboxView('all');
                  setDepartmentFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-bold text-[#72A4F2] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isSelected = selectedChat ? selectedChat.id === chat.id : false;
              const isChecked = selectedIds.includes(chat.id);

              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-2.5 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-[#BED0F7]/40 border-l-4 border-[#202020]'
                      : chat.unread > 0
                      ? 'bg-white font-semibold'
                      : 'hover:bg-white/80'
                  }`}
                >
                  {/* Select Checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onClick={(e) => handleToggleSelectOne(e, chat.id)}
                    onChange={() => {}}
                    className="mt-2.5 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2] h-3.5 w-3.5 shrink-0"
                  />

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-[14px] bg-[#72A4F2] border-1.5 border-[#202020] text-[#202020] font-black font-serif text-sm flex items-center justify-center shrink-0">
                    {chat.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Thread Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`text-xs truncate ${
                            chat.unread > 0 ? 'font-black text-[#202020]' : 'font-bold text-[#202020]'
                          }`}
                        >
                          {chat.name}
                        </span>
                        {chat.isGroup && (
                          <Badge variant="blue" size="sm" className="text-[9px] px-1 py-0 font-bold">
                            Group
                          </Badge>
                        )}
                        {chat.isArchived && (
                          <Badge variant="charcoal" size="sm" className="text-[9px] px-1 py-0">
                            Archived
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-[#202020]/60 font-semibold shrink-0 ml-1">
                        12:30 PM
                      </span>
                    </div>

                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        chat.unread > 0
                          ? 'font-bold text-[#202020]'
                          : 'text-[#202020]/70 font-medium'
                      }`}
                    >
                      {chat.lastMessage}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          chat.status === 'open'
                            ? 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]'
                            : chat.status === 'pending'
                            ? 'bg-[#fef9c3] text-[#854d0e] border-[#fde047]'
                            : 'bg-[#F4EFE7] text-[#202020] border-[#202020]'
                        }`}
                      >
                        {chat.status.toUpperCase()}
                      </span>

                      <span className="text-[10px] text-[#202020]/60 font-medium truncate max-w-[90px]">
                        {chat.team}
                      </span>

                      <div className="ml-auto flex items-center gap-1.5">
                        {chat.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#202020] text-white text-[10px] font-bold flex items-center justify-center">
                            {chat.unread}
                          </span>
                        )}

                        {/* Quick hover toggle read/unread */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleReadStatus(e, chat.id)}
                          title={chat.unread > 0 ? 'Mark as read' : 'Mark as unread'}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#202020]/60 hover:text-black rounded-full hover:bg-[#F4EFE7] transition-all"
                        >
                          {chat.unread > 0 ? (
                            <MailOpen className="h-3.5 w-3.5" />
                          ) : (
                            <Mail className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Column 2: Chat Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#F4EFE7]/30 transition-all ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F4EFE7]/20">
            <div className="w-16 h-16 rounded-[22px] bg-[#BED0F7]/50 border-2 border-[#202020] flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8 text-[#202020]" />
            </div>
            <h3 className="text-lg font-bold font-serif text-[#202020] mb-1">
              Shared Team Inbox
            </h3>
            <p className="text-xs text-[#202020]/70 max-w-sm mb-6 leading-relaxed">
              Inbound customer messages from your verified Meta WhatsApp Business Account will automatically populate here in real time.
            </p>
            <div className="p-4 bg-white border-2 border-[#202020] rounded-[20px] max-w-md text-left text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-[#202020]">
                <ShieldAlert className="w-4 h-4 text-[#72A4F2]" />
                24-Hour Customer Care Window
              </div>
              <p className="text-[11px] text-[#202020]/70 leading-normal">
                When a customer sends an inbound message, a 24-hour freeform messaging session opens. After 24 hours of customer inactivity, Meta requires pre-approved template messages to re-engage.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b-2 border-[#202020] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Back Button */}
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-1.5 rounded-[12px] border border-[#202020] text-[#202020] hover:bg-[#F4EFE7] shrink-0"
              title="Back to conversation list"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="w-9 h-9 rounded-[14px] bg-[#BED0F7] border-1.5 border-[#202020] text-[#202020] font-black text-xs font-serif flex items-center justify-center shrink-0">
              {selectedChat.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#202020] font-serif truncate">
                  {selectedChat.name}
                </span>
                <span className="text-[10px] text-[#202020]/60 font-mono font-medium hidden md:inline">
                  {selectedChat.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#202020]/70 font-medium truncate">
                <span>
                  Dept: <strong>{selectedChat.team}</strong>
                </span>
                <span>•</span>
                <span>
                  Agent: <strong>{selectedChat.assignedTo}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Transfer Thread Button (Phase 5) */}
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-2.5 py-1 bg-white hover:bg-[#BED0F7]/30 border-2 border-[#202020] rounded-[14px] text-xs font-bold text-[#202020] flex items-center gap-1.5 transition-all shadow-2xs"
              title="Transfer conversation to another department or agent"
            >
              <Forward className="h-3.5 w-3.5 text-[#72A4F2]" />
              <span className="hidden md:inline">Transfer</span>
            </button>

            {/* Mark as Unread / Read Button */}
            <button
              onClick={handleToggleCurrentChatRead}
              className="px-2.5 py-1 bg-[#F4EFE7] hover:bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[14px] text-xs font-bold text-[#202020] flex items-center gap-1.5 transition-all"
              title={selectedChat.unread > 0 ? 'Mark as read' : 'Mark as unread'}
            >
              {selectedChat.unread > 0 ? (
                <>
                  <MailOpen className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Read</span>
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Unread</span>
                </>
              )}
            </button>

            {/* Thread Status Dropdown / Controls */}
            <div className="hidden lg:flex items-center bg-[#F4EFE7] border-2 border-[#202020] rounded-[16px] p-0.5 text-xs font-bold">
              <button
                onClick={() => updateStatus('open')}
                className={`px-2 py-0.5 rounded-[12px] ${
                  selectedChat.status === 'open' ? 'bg-[#72A4F2] text-[#202020]' : 'text-[#202020]/60'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => updateStatus('pending')}
                className={`px-2 py-0.5 rounded-[12px] ${
                  selectedChat.status === 'pending' ? 'bg-[#fde047] text-[#854d0e]' : 'text-[#202020]/60'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => updateStatus('resolved')}
                className={`px-2 py-0.5 rounded-[12px] ${
                  selectedChat.status === 'resolved' ? 'bg-[#202020] text-white' : 'text-[#202020]/60'
                }`}
              >
                Closed
              </button>
            </div>

            <Badge variant={windowStatus.isActive ? 'blue' : 'yellow'} size="sm" className="gap-1 hidden sm:inline-flex">
              <Clock className="h-3 w-3" />
              {windowStatus.remainingFormatted}
            </Badge>
          </div>
        </div>

        {/* Agent Collision Warning Banner (FR-063) */}
        {hasCollision && (
          <div className="bg-[#fee2e2] border-b-2 border-[#202020] px-6 py-2 flex items-center justify-between text-xs text-[#991b1b] font-bold">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#E35A4F]" />
              <span>Collision Lock: Agent Sarah Jenkins is currently drafting a reply in this thread.</span>
            </div>
            <span className="text-[10px] bg-white border border-[#202020] text-[#202020] px-2 py-0.5 rounded-full font-mono">
              Lock expires in 45s
            </span>
          </div>
        )}

        {/* 24-Hour Window Notice Banner */}
        {!windowStatus.isActive && (
          <div className="bg-[#fef9c3] border-b-2 border-[#202020] px-6 py-2 flex items-center justify-between text-xs text-[#854d0e] font-semibold">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#854d0e]" />
              <span>Service window expired. Free-form text and voice messages are locked by Meta policy.</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-[11px] py-1 h-auto"
              onClick={() => setIsTemplateModalOpen(true)}
            >
              Select Approved Template
            </Button>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}
            >
              {msg.type === 'voice' ? (
                /* WhatsApp Voice Note Bubble */
                <div
                  className={`rounded-[22px] p-3.5 border-2 border-[#202020] max-w-sm sm:max-w-md ${
                    msg.sender === 'agent' ? 'bg-[#72A4F2]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {}}
                      className="w-10 h-10 rounded-full bg-[#202020] text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    </button>
                    <div className="flex items-center gap-1 h-6">
                      {[35, 70, 45, 90, 60, 100, 50, 85, 70, 60, 95, 65, 40, 80].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}%` }}
                          className="w-1 rounded-full bg-[#202020]/60"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#202020]/75 mt-1 font-mono">
                    <span>{formatSeconds(msg.audioDuration || 6)}</span>
                    <span>{msg.time} • ✓✓</span>
                  </div>
                </div>
              ) : (
                /* Standard Text Message Bubble */
                <div
                  className={`max-w-md rounded-[22px] p-4 border-2 border-[#202020] ${
                    msg.sender === 'agent'
                      ? 'bg-[#72A4F2] text-[#202020] font-medium'
                      : 'bg-white text-[#202020]'
                  }`}
                >
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-bold ${
                      msg.sender === 'agent' ? 'text-[#202020]/70' : 'text-[#202020]/50'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {msg.sender === 'agent' && <CheckCheck className="h-3 w-3 text-[#202020]" />}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Reply Bar / Voice Message Experience */}
        <div className="p-4 bg-white border-t-2 border-[#202020]">
          {voiceState === 'recording' || voiceState === 'paused' ? (
            /* Recording Interface */
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fee2e2]/70 border-2 border-[#E35A4F] rounded-[24px] px-5 py-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    voiceState === 'recording' ? 'bg-[#E35A4F] animate-ping' : 'bg-[#E35A4F]/60'
                  }`}
                />
                <div>
                  <span className="text-xs font-bold text-[#991b1b] font-serif block">
                    {voiceState === 'recording' ? 'Recording Voice Message...' : 'Recording Paused'}
                  </span>
                  <span className="font-mono font-black text-sm text-[#991b1b]">
                    {formatSeconds(recordingSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {voiceState === 'recording' ? (
                  <button
                    onClick={handlePauseRecording}
                    className="px-3 py-2 bg-white text-[#202020] hover:bg-[#F4EFE7] rounded-[16px] border-2 border-[#202020] flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResumeRecording}
                    className="px-3 py-2 bg-[#72A4F2] text-[#202020] rounded-[16px] border-2 border-[#202020] flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Play className="h-3.5 w-3.5 fill-[#202020]" />
                    <span>Resume</span>
                  </button>
                )}

                <button
                  onClick={handleFinishRecording}
                  className="px-3.5 py-2 bg-[#202020] text-white rounded-[16px] border-2 border-[#202020] flex items-center gap-1.5 text-xs font-bold shadow-xs"
                >
                  <Square className="h-3.5 w-3.5 fill-white" />
                  <span>Finish</span>
                </button>

                <button
                  onClick={handleDiscardRecording}
                  className="p-2 text-[#991b1b] hover:bg-[#fee2e2] rounded-[16px] border-2 border-[#E35A4F]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : voiceState === 'preview' ? (
            /* Preview Interface */
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[24px] px-5 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePreviewPlayback}
                  className="w-10 h-10 rounded-full bg-[#202020] text-white flex items-center justify-center shrink-0"
                >
                  {isPlayingPreview ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  )}
                </button>
                <span className="font-mono font-bold text-xs">
                  {formatSeconds(recordingSeconds || 6)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscardRecording}
                  className="p-2 text-[#991b1b] hover:bg-[#fee2e2] rounded-[16px] border-2 border-[#202020]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <Button
                  variant="primary"
                  size="md"
                  className="gap-1.5 font-bold"
                  onClick={handleSendVoiceMessage}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Voice Message</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Standard Text Input Mode */
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 text-[#202020] hover:bg-[#F4EFE7] rounded-[16px] border-2 border-[#202020] transition-colors shrink-0"
                title="Attach media or document"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Canned Quick Responses Button (Phase 5) */}
              <button
                onClick={() => setShowCannedModal(true)}
                className="p-2.5 text-[#202020] bg-[#BED0F7]/40 hover:bg-[#BED0F7] rounded-[16px] border-2 border-[#202020] transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
                title="Quick Responses / Canned Snippets (/greet, /hours, etc.)"
              >
                <Sparkles className="h-4 w-4 text-[#202020]" />
              </button>

              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                disabled={!windowStatus.isActive}
                placeholder={
                  windowStatus.isActive
                    ? 'Type a reply, use / for quick replies, or click mic for voice note...'
                    : 'Customer service window expired. Use an approved template.'
                }
                className="flex-1 px-4 py-2.5 text-xs bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#72A4F2] font-medium disabled:opacity-60"
              />

              {/* Mic button for voice recording */}
              <button
                onClick={handleStartRecording}
                disabled={!windowStatus.isActive}
                className="p-2.5 text-[#202020] bg-[#BED0F7]/50 hover:bg-[#BED0F7] rounded-[16px] border-2 border-[#202020] transition-colors shrink-0 disabled:opacity-50"
                title="Record voice message (mic)"
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Send button */}
              <Button
                variant="primary"
                size="md"
                onClick={handleSendReply}
                disabled={!windowStatus.isActive || !replyText.trim()}
                className="gap-2 font-bold shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </Button>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* MODAL 1: CANNED RESPONSES PICKER (Phase 5) */}
      {showCannedModal && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  Canned Quick Responses
                </h3>
              </div>
              <button
                onClick={() => setShowCannedModal(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {CANNED_RESPONSES.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectCanned(item.content)}
                  className="p-3 bg-[#F9F6F1] hover:bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[18px] cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#202020]">{item.title}</span>
                    <span className="font-mono text-[10px] bg-white border border-[#202020] px-2 py-0.5 rounded-full font-bold">
                      {item.shortcut}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#202020]/75 line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCannedModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DEPARTMENT TRIAGE & THREAD REASSIGNMENT (Phase 5) */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Forward className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  Transfer Conversation
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  Target Department *
                </label>
                <select
                  value={transferDept}
                  onChange={(e) => setTransferDept(e.target.value as DepartmentName)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Sales Desk">Sales Desk</option>
                  <option value="Compliance">Compliance & Legal</option>
                  <option value="Technical Operations">Technical Operations</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  Assign to Specific Agent
                </label>
                <select
                  value={transferAgent}
                  onChange={(e) => setTransferAgent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Sales Desk)</option>
                  <option value="Chethan Reddy">Chethan Reddy (Support)</option>
                  <option value="Rahul Sharma">Rahul Sharma (Compliance)</option>
                  <option value="Tariq Mansoor">Tariq Mansoor (Technical)</option>
                  <option value="Unassigned">Leave Unassigned in Queue</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  Internal Transfer Handover Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer needs quote confirmation for bulk cosmetic order..."
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Transfer Conversation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
