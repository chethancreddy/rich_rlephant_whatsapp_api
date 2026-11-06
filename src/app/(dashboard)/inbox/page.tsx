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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateServiceWindow } from '@/lib/service-window';
import { getSupportedAudioMimeType, validateWhatsAppAudio } from '@/lib/audio-recorder';

interface ConversationItem {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  assignedTo: string;
  team: string;
  status: 'open' | 'pending' | 'resolved';
  isCustomerLastInbound: boolean;
  tags: string[];
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

const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'c1',
    name: 'Tariq Mansoor',
    phone: '+971 50 443 2190',
    lastMessage: 'Can you please confirm my delivery window for order #9827?',
    lastMessageAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago (ACTIVE)
    unread: 1,
    assignedTo: 'Chethan Reddy',
    team: 'Customer Support',
    status: 'open',
    isCustomerLastInbound: true,
    tags: ['VIP', 'Dubai Marina', 'Support'],
  },
  {
    id: 'c2',
    name: 'Fatima Al Zaabi',
    phone: '+971 55 982 1102',
    lastMessage: 'Thank you, that solved my issue!',
    lastMessageAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hrs ago (EXPIRED)
    unread: 0,
    assignedTo: 'Sarah Jenkins',
    team: 'Sales Desk',
    status: 'resolved',
    isCustomerLastInbound: false,
    tags: ['Retail', 'Resolved'],
  },
  {
    id: 'c3',
    name: 'Rahul Sharma',
    phone: '+971 52 710 4433',
    lastMessage: 'STOP',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread: 0,
    assignedTo: 'Automated System',
    team: 'Compliance',
    status: 'pending',
    isCustomerLastInbound: true,
    tags: ['Suppressed', 'Opt-Out'],
  },
];

const INITIAL_MESSAGES: Record<string, MessageItem[]> = {
  c1: [
    {
      id: 'm1',
      conversationId: 'c1',
      sender: 'customer',
      type: 'text',
      text: 'Can you please confirm my delivery window for order #9827?',
      time: '11:45 AM',
      status: 'read',
    },
    {
      id: 'm2',
      conversationId: 'c1',
      sender: 'agent',
      type: 'text',
      text: 'Hello Tariq! Our delivery team is scheduled to arrive between 2:00 PM and 4:00 PM today.',
      time: '11:47 AM',
      status: 'delivered',
    },
    {
      id: 'm3',
      conversationId: 'c1',
      sender: 'customer',
      type: 'voice',
      audioDuration: 8,
      time: '11:49 AM',
      status: 'read',
    },
  ],
  c2: [
    {
      id: 'm201',
      conversationId: 'c2',
      sender: 'agent',
      type: 'text',
      text: 'Your warranty registration is confirmed. Is there anything else you need assistance with?',
      time: 'Yesterday',
      status: 'read',
    },
    {
      id: 'm202',
      conversationId: 'c2',
      sender: 'customer',
      type: 'text',
      text: 'Thank you, that solved my issue!',
      time: 'Yesterday',
      status: 'read',
    },
  ],
  c3: [
    {
      id: 'm301',
      conversationId: 'c3',
      sender: 'customer',
      type: 'text',
      text: 'STOP',
      time: '2 hours ago',
      status: 'read',
    },
    {
      id: 'm302',
      conversationId: 'c3',
      sender: 'agent',
      type: 'text',
      text: 'You have been unsubscribed from updates. Reply START at any time to re-subscribe.',
      time: '2 hours ago',
      status: 'delivered',
    },
  ],
};

type VoiceState = 'idle' | 'recording' | 'paused' | 'preview' | 'sending';

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>(MOCK_CONVERSATIONS);
  const [selectedChat, setSelectedChat] = useState<ConversationItem>(MOCK_CONVERSATIONS[0]);
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>(INITIAL_MESSAGES);
  const [activeTab, setActiveTab] = useState<'messages' | 'notes'>('messages');
  const [replyText, setReplyText] = useState('');

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

  // Simulated agent collision: Chat c2 is currently being viewed by Sarah Jenkins
  const hasCollision = selectedChat.id === 'c2';
  const windowStatus = calculateServiceWindow(selectedChat.lastMessageAt);

  const currentMessages = messagesMap[selectedChat.id] || [];

  // Inbox Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'me' | 'unassigned'>('all');

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread > 0 ? 1 : 0), 0);
  const readCount = conversations.reduce((acc, c) => acc + (c.unread === 0 ? 1 : 0), 0);

  const filteredConversations = conversations.filter((chat) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        chat.name.toLowerCase().includes(q) ||
        chat.phone.includes(q) ||
        chat.lastMessage.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (readFilter === 'unread' && chat.unread === 0) return false;
    if (readFilter === 'read' && chat.unread > 0) return false;

    if (assignedFilter === 'me' && chat.assignedTo !== 'Chethan Reddy') return false;
    if (assignedFilter === 'unassigned' && chat.assignedTo !== 'Unassigned' && chat.assignedTo !== 'Automated System') return false;

    return true;
  });

  const handleSelectChat = (chat: ConversationItem) => {
    if (chat.unread > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
      );
    }
    setSelectedChat({ ...chat, unread: 0 });
    handleDiscardRecording();
  };

  const handleToggleReadStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = c.unread > 0 ? 0 : 1;
          if (selectedChat.id === id) {
            setSelectedChat((curr) => ({ ...curr, unread: next }));
          }
          return { ...c, unread: next };
        }
        return c;
      })
    );
  };

  const handleToggleCurrentChatRead = () => {
    const isCurrentlyUnread = selectedChat.unread > 0;
    const nextUnread = isCurrentlyUnread ? 0 : 1;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedChat.id ? { ...c, unread: nextUnread } : c))
    );
    setSelectedChat((curr) => ({ ...curr, unread: nextUnread }));
  };

  const handleMarkAllAsRead = () => {
    setConversations((prev) => prev.map((c) => ({ ...c, unread: 0 })));
    setSelectedChat((curr) => ({ ...curr, unread: 0 }));
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

  // 1. Start Voice Recording
  const handleStartRecording = async () => {
    if (!windowStatus.isActive) {
      alert('Policy Restriction: Free-form voice notes can only be sent within the 24-hour customer service window. Please select an approved WhatsApp template to re-engage.');
      return;
    }

    setVoiceState('recording');
    setRecordingSeconds(0);
    setPreviewAudioBlob(null);
    setPreviewAudioUrl(null);
    audioChunksRef.current = [];

    // Start timer accumulating only when active recording
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Initialize MediaRecorder
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedAudioMimeType();
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const finalMime = recorder.mimeType || 'audio/ogg; codecs=opus';
          const blob = new Blob(audioChunksRef.current, { type: finalMime });
          setPreviewAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewAudioUrl(url);
          setVoiceState('preview');
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } else {
        // Fallback for headless / simulated recording
      }
    } catch {
      // Permission denied or headless: continues in robust simulated recording mode
    }
  };

  // 2. Pause Voice Recording
  const handlePauseRecording = () => {
    if (voiceState !== 'recording') return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }

    setVoiceState('paused');
  };

  // 3. Resume Voice Recording
  const handleResumeRecording = () => {
    if (voiceState !== 'paused') return;

    // Resume timer strictly from where it stopped
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }

    setVoiceState('recording');
  };

  // 4. Finish / Stop Recording (Transitions to Preview Mode)
  const handleFinishRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    } else {
      // Fallback for simulated environments: build a synthetic audio blob
      const duration = recordingSeconds || 5;
      const syntheticBlob = new Blob(['RIFF....WAVEfmt '], { type: 'audio/ogg; codecs=opus' });
      setPreviewAudioBlob(syntheticBlob);
      const url = URL.createObjectURL(syntheticBlob);
      setPreviewAudioUrl(url);
      setVoiceState('preview');
    }
  };

  // 5. Discard / Cancel Voice Recording
  const handleDiscardRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
    }

    if (previewAudioElementRef.current) {
      previewAudioElementRef.current.pause();
    }

    setIsPlayingPreview(false);
    setPreviewCurrentTime(0);
    setVoiceState('idle');
    setRecordingSeconds(0);
    setPreviewAudioBlob(null);
    setPreviewAudioUrl(null);
    audioChunksRef.current = [];
  };

  // 6. Preview Playback Toggle
  const handleTogglePreviewPlayback = () => {
    if (!previewAudioUrl) return;

    if (isPlayingPreview) {
      if (previewAudioElementRef.current) {
        previewAudioElementRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioElementRef.current) {
        const audio = new Audio(previewAudioUrl);
        previewAudioElementRef.current = audio;

        audio.ontimeupdate = () => {
          setPreviewCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
          setIsPlayingPreview(false);
          setPreviewCurrentTime(0);
        };
      }

      previewAudioElementRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  // 7. Explicit Send Voice Message (Meta WhatsApp Cloud API Compliance)
  const handleSendVoiceMessage = async () => {
    const duration = recordingSeconds || 5;

    if (previewAudioBlob) {
      const validation = validateWhatsAppAudio(previewAudioBlob, duration);
      if (!validation.valid) {
        alert(`Validation Error: ${validation.error}`);
        return;
      }
    }

    setVoiceState('sending');

    const messageId = `vm_${Date.now()}`;
    const newVoiceMessage: MessageItem = {
      id: messageId,
      conversationId: selectedChat.id,
      sender: 'agent',
      type: 'voice',
      audioUrl: previewAudioUrl || '',
      audioDuration: duration,
      time: 'Just now',
      status: 'sending',
    };

    // Optimistically add to chat thread
    setMessagesMap((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newVoiceMessage],
    }));

    // Update conversation sidebar preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              lastMessage: `🎤 Voice note (${formatSeconds(duration)})`,
              lastMessageAt: new Date().toISOString(),
            }
          : c
      )
    );

    try {
      const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageBody: `🎤 Voice note (${formatSeconds(duration)})`,
          messageType: 'audio',
          voice: true, // Meta Cloud API audio.voice = true
          audioDuration: duration,
          mediaUrl: previewAudioUrl || 'https://media.rich-rlephant.com/audio/voice-note-sample.ogg',
          agentId: 'agent_current',
          contactPhone: selectedChat.phone,
          lastCustomerMessageAt: selectedChat.lastMessageAt,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update message status to delivered
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === messageId ? { ...m, status: 'delivered' } : m
          ),
        }));
      } else {
        // Mark failed
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === messageId
              ? { ...m, status: 'failed', errorMessage: data.error || 'Failed to dispatch voice note' }
              : m
          ),
        }));
      }
    } catch {
      setMessagesMap((prev) => ({
        ...prev,
        [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
          m.id === messageId
            ? { ...m, status: 'failed', errorMessage: 'Network connection failed' }
            : m
        ),
      }));
    } finally {
      handleDiscardRecording();
    }
  };

  // 8. Retry Failed Voice Note
  const handleRetryMessage = async (msg: MessageItem) => {
    setMessagesMap((prev) => ({
      ...prev,
      [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
        m.id === msg.id ? { ...m, status: 'sending', errorMessage: undefined } : m
      ),
    }));

    try {
      const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageBody: msg.text || `🎤 Voice note (${formatSeconds(msg.audioDuration || 5)})`,
          messageType: msg.type === 'voice' ? 'audio' : 'text',
          voice: msg.type === 'voice',
          audioDuration: msg.audioDuration,
          mediaUrl: msg.audioUrl,
          agentId: 'agent_current',
          contactPhone: selectedChat.phone,
          lastCustomerMessageAt: selectedChat.lastMessageAt,
        }),
      });

      if (res.ok) {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === msg.id ? { ...m, status: 'delivered' } : m
          ),
        }));
      } else {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
            m.id === msg.id ? { ...m, status: 'failed', errorMessage: 'Retry attempt rejected by Meta' } : m
          ),
        }));
      }
    } catch {
      setMessagesMap((prev) => ({
        ...prev,
        [selectedChat.id]: (prev[selectedChat.id] || []).map((m) =>
          m.id === msg.id ? { ...m, status: 'failed', errorMessage: 'Network retry failed' } : m
        ),
      }));
    }
  };

  // 9. In-Thread Audio Voice Note Playback
  const handleTogglePlayVoice = (msg: MessageItem) => {
    if (playingVoiceId === msg.id) {
      if (threadAudioPlayerRef.current) {
        threadAudioPlayerRef.current.pause();
      }
      setPlayingVoiceId(null);
    } else {
      if (threadAudioPlayerRef.current) {
        threadAudioPlayerRef.current.pause();
      }

      setPlayingVoiceId(msg.id);

      if (msg.audioUrl) {
        const audio = new Audio(msg.audioUrl);
        threadAudioPlayerRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => setPlayingVoiceId(null);
      } else {
        // Fallback tone preview duration
        setTimeout(() => {
          setPlayingVoiceId(null);
        }, (msg.audioDuration || 6) * 1000);
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    const newMsg: MessageItem = {
      id: `m_${Date.now()}`,
      conversationId: selectedChat.id,
      sender: 'agent',
      type: 'text',
      text: replyText,
      time: 'Just now',
      status: 'delivered',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));

    const textToSend = replyText;
    setReplyText('');

    try {
      const res = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageBody: textToSend,
          agentId: 'agent_current',
          contactPhone: selectedChat.phone,
          lastCustomerMessageAt: selectedChat.lastMessageAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to dispatch reply');
      }
    } catch {
      alert('Network error dispatching message');
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    try {
      const res = await fetch(`/api/conversations/${selectedChat.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteBody: newNoteText,
          authorName: 'Chethan Reddy',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotes([
          ...notes,
          {
            id: data.note.id,
            author: data.note.author_name,
            text: data.note.body,
            time: 'Just now',
          },
        ]);
        setNewNoteText('');
      }
    } catch {
      alert('Failed to save internal note');
    }
  };

  const updateStatus = (newStatus: 'open' | 'pending' | 'resolved') => {
    const updated = conversations.map((c) =>
      c.id === selectedChat.id ? { ...c, status: newStatus } : c
    );
    setConversations(updated);
    setSelectedChat({ ...selectedChat, status: newStatus });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white border-2 border-[#202020] rounded-[28px] overflow-hidden">
      {/* Column 1: Conversations List */}
      <div className="w-84 border-r-2 border-[#202020] flex flex-col shrink-0 bg-[#F9F6F1]">
        {/* Search Header */}
        <div className="p-3 border-b-2 border-[#202020] bg-white space-y-2.5">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-[#202020]/50" />
            <input
              type="text"
              placeholder="Search conversations..."
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

          {/* Primary Read/Unread Filter Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#F4EFE7] border-2 border-[#202020] rounded-[16px] text-xs font-bold">
            <button
              onClick={() => setReadFilter('all')}
              className={`py-1 rounded-[12px] flex items-center justify-center gap-1.5 transition-all ${
                readFilter === 'all'
                  ? 'bg-[#202020] text-white shadow-xs'
                  : 'text-[#202020]/70 hover:text-[#202020] hover:bg-white/50'
              }`}
            >
              <span>All</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  readFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#D8D0C4] text-[#202020]'
                }`}
              >
                {conversations.length}
              </span>
            </button>

            <button
              onClick={() => setReadFilter('unread')}
              className={`py-1 rounded-[12px] flex items-center justify-center gap-1.5 transition-all ${
                readFilter === 'unread'
                  ? 'bg-[#202020] text-white shadow-xs'
                  : 'text-[#202020]/70 hover:text-[#202020] hover:bg-white/50'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 bg-[#72A4F2] text-[#202020] rounded-full font-black">
                  {unreadCount}
                </span>
              ) : (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    readFilter === 'unread' ? 'bg-white/20 text-white' : 'bg-[#D8D0C4] text-[#202020]'
                  }`}
                >
                  0
                </span>
              )}
            </button>

            <button
              onClick={() => setReadFilter('read')}
              className={`py-1 rounded-[12px] flex items-center justify-center gap-1.5 transition-all ${
                readFilter === 'read'
                  ? 'bg-[#202020] text-white shadow-xs'
                  : 'text-[#202020]/70 hover:text-[#202020] hover:bg-white/50'
              }`}
            >
              <span>Read</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  readFilter === 'read' ? 'bg-white/20 text-white' : 'bg-[#D8D0C4] text-[#202020]'
                }`}
              >
                {readCount}
              </span>
            </button>
          </div>

          {/* Secondary Quick Filter Pills & Mark All Read */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setAssignedFilter((curr) => (curr === 'me' ? 'all' : 'me'))
                }
                className={`px-2 py-0.5 rounded-[12px] border font-bold transition-all ${
                  assignedFilter === 'me'
                    ? 'bg-[#72A4F2] text-[#202020] border-[#202020]'
                    : 'bg-[#F4EFE7] text-[#202020]/70 border-[#202020]/40 hover:border-[#202020]'
                }`}
              >
                👤 Assigned to Me
              </button>
              <button
                onClick={() =>
                  setAssignedFilter((curr) => (curr === 'unassigned' ? 'all' : 'unassigned'))
                }
                className={`px-2 py-0.5 rounded-[12px] border font-bold transition-all ${
                  assignedFilter === 'unassigned'
                    ? 'bg-[#BED0F7] text-[#202020] border-[#202020]'
                    : 'bg-[#F4EFE7] text-[#202020]/70 border-[#202020]/40 hover:border-[#202020]'
                }`}
              >
                Unassigned
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-[#202020]/70 hover:text-black underline"
                title="Mark all conversations as read"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#D8D0C4]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#202020]/60 space-y-1">
              <p className="font-bold">No conversations found</p>
              <p className="text-[11px]">
                {readFilter === 'unread'
                  ? 'All caught up! No unread customer messages.'
                  : 'Try clearing your search or filter criteria.'}
              </p>
              {(searchQuery || readFilter !== 'all' || assignedFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setReadFilter('all');
                    setAssignedFilter('all');
                  }}
                  className="mt-2 text-xs font-bold text-[#72A4F2] hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 relative group ${
                  selectedChat.id === chat.id
                    ? 'bg-[#BED0F7]/40 border-l-4 border-[#202020]'
                    : chat.unread > 0
                    ? 'bg-white font-semibold'
                    : 'hover:bg-white/80'
                }`}
              >
                <div className="w-10 h-10 rounded-[14px] bg-[#72A4F2] border-1.5 border-[#202020] text-[#202020] font-black font-serif text-sm flex items-center justify-center shrink-0">
                  {chat.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs truncate ${
                        chat.unread > 0 ? 'font-black text-[#202020]' : 'font-bold text-[#202020]'
                      }`}
                    >
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-[#202020]/60 font-semibold">12:30 PM</span>
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

                    <span className="text-[10px] text-[#202020]/50 font-medium truncate max-w-[100px]">
                      {chat.assignedTo === 'Chethan Reddy' ? 'You' : chat.assignedTo}
                    </span>

                    <div className="ml-auto flex items-center gap-1.5">
                      {chat.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#202020] text-white text-[10px] font-bold flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}

                      {/* Quick toggle read / unread icon on hover */}
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
              </button>
            ))
          )}
        </div>
      </div>

      {/* Column 2: Chat Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4EFE7]/30">
        {/* Chat Header */}
        <div className="h-16 bg-white border-b-2 border-[#202020] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[14px] bg-[#BED0F7] border-1.5 border-[#202020] text-[#202020] font-black text-xs font-serif flex items-center justify-center">
              {selectedChat.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#202020] font-serif">{selectedChat.name}</span>
                <span className="text-[10px] text-[#202020]/60 font-mono font-medium">{selectedChat.phone}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#202020]/70 font-medium">
                  Assigned: <strong>{selectedChat.assignedTo}</strong> ({selectedChat.team})
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mark as Unread / Read Button */}
            <button
              onClick={handleToggleCurrentChatRead}
              className="px-2.5 py-1.5 bg-[#F4EFE7] hover:bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[16px] text-xs font-bold text-[#202020] flex items-center gap-1.5 transition-all"
              title={selectedChat.unread > 0 ? 'Mark this conversation as read' : 'Mark this conversation as unread'}
            >
              {selectedChat.unread > 0 ? (
                <>
                  <MailOpen className="h-3.5 w-3.5" />
                  <span>Mark Read</span>
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  <span>Mark Unread</span>
                </>
              )}
            </button>

            {/* Thread Status Dropdown / Controls */}
            <div className="flex items-center bg-[#F4EFE7] border-2 border-[#202020] rounded-[18px] p-0.5 text-xs font-bold">
              <button
                onClick={() => updateStatus('open')}
                className={`px-2.5 py-1 rounded-[14px] ${
                  selectedChat.status === 'open' ? 'bg-[#72A4F2] text-[#202020]' : 'text-[#202020]/60'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => updateStatus('pending')}
                className={`px-2.5 py-1 rounded-[14px] ${
                  selectedChat.status === 'pending' ? 'bg-[#fde047] text-[#854d0e]' : 'text-[#202020]/60'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => updateStatus('resolved')}
                className={`px-2.5 py-1 rounded-[14px] ${
                  selectedChat.status === 'resolved' ? 'bg-[#202020] text-white' : 'text-[#202020]/60'
                }`}
              >
                Resolved
              </button>
            </div>

            <Badge variant={windowStatus.isActive ? 'blue' : 'yellow'} size="sm" className="gap-1">
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
          <div className="bg-[#fef9c3] border-b-2 border-[#202020] px-6 py-2.5 flex items-center justify-between text-xs text-[#854d0e] font-semibold">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#854d0e]" />
              <span>Customer service window expired. Free-form text and voice messages are locked by Meta policy.</span>
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
              className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'voice' ? (
                /* Voice Message Audio Player Bubble */
                <div
                  className={`max-w-xs md:max-w-sm rounded-[24px] p-3.5 border-2 border-[#202020] flex items-center gap-3.5 ${
                    msg.sender === 'agent' ? 'bg-[#72A4F2] text-[#202020]' : 'bg-white text-[#202020]'
                  }`}
                >
                  {/* Play / Pause circular button */}
                  <button
                    onClick={() => handleTogglePlayVoice(msg)}
                    className="w-10 h-10 rounded-full bg-[#202020] text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
                    title={playingVoiceId === msg.id ? 'Pause voice message' : 'Play voice message'}
                  >
                    {playingVoiceId === msg.id ? (
                      <Pause className="h-4 w-4 fill-white" />
                    ) : (
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    )}
                  </button>

                  {/* Sound wave bars */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 h-6">
                      {[35, 75, 45, 90, 60, 100, 40, 85, 70, 50, 95, 60, 40, 80, 55, 90, 45, 70].map(
                        (heightPercent, idx) => (
                          <span
                            key={idx}
                            style={{ height: `${heightPercent}%` }}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              playingVoiceId === msg.id
                                ? 'bg-[#202020] animate-pulse'
                                : 'bg-[#202020]/40'
                            }`}
                          />
                        )
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#202020]/75 mt-1 font-mono">
                      <span>{formatSeconds(msg.audioDuration || 6)}</span>
                      <div className="flex items-center gap-1.5">
                        <span>{msg.time}</span>
                        {msg.sender === 'agent' && (
                          <>
                            {msg.status === 'sending' && <Loader2 className="h-3 w-3 animate-spin text-[#202020]" />}
                            {msg.status === 'sent' && <Check className="h-3 w-3 text-[#202020]" />}
                            {(msg.status === 'delivered' || msg.status === 'read') && (
                              <CheckCheck className={`h-3 w-3 ${msg.status === 'read' ? 'text-[#065f46]' : 'text-[#202020]'}`} />
                            )}
                            {msg.status === 'failed' && (
                              <button
                                onClick={() => handleRetryMessage(msg)}
                                className="text-[#E35A4F] flex items-center gap-0.5 font-bold hover:underline"
                                title="Retry sending"
                              >
                                <AlertCircle className="h-3 w-3" />
                                <span>Retry</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
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
            /* 1. Live Recording Interface (with Pause, Resume, Stop/Finish, and Cancel) */
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fee2e2]/70 border-2 border-[#E35A4F] rounded-[24px] px-5 py-3 animate-in fade-in duration-150">
              {/* Indicator & Duration */}
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

              {/* Animated waveform bars (live) */}
              <div className="hidden sm:flex items-center gap-1 h-6">
                {[30, 80, 50, 100, 60, 90, 40, 85, 70, 95, 55, 75, 45, 90].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full transition-all ${
                      voiceState === 'recording' ? 'bg-[#E35A4F] animate-pulse' : 'bg-[#E35A4F]/40'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons: Pause/Resume, Finish/Stop, Cancel/Delete */}
              <div className="flex items-center gap-2">
                {/* Pause / Resume Button */}
                {voiceState === 'recording' ? (
                  <button
                    onClick={handlePauseRecording}
                    className="px-3 py-2 bg-white text-[#202020] hover:bg-[#F4EFE7] rounded-[16px] border-2 border-[#202020] flex items-center gap-1.5 text-xs font-bold transition-all"
                    title="Pause recording"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResumeRecording}
                    className="px-3 py-2 bg-[#72A4F2] text-[#202020] hover:bg-[#5f93e2] rounded-[16px] border-2 border-[#202020] flex items-center gap-1.5 text-xs font-bold transition-all"
                    title="Resume recording"
                  >
                    <Play className="h-3.5 w-3.5 fill-[#202020]" />
                    <span>Resume</span>
                  </button>
                )}

                {/* Finish / Stop Recording Button (transitions to Preview) */}
                <button
                  onClick={handleFinishRecording}
                  className="px-3.5 py-2 bg-[#202020] text-white hover:bg-black rounded-[16px] border-2 border-[#202020] flex items-center gap-1.5 text-xs font-bold shadow-xs transition-all"
                  title="Finish recording and review"
                >
                  <Square className="h-3.5 w-3.5 fill-white" />
                  <span>Finish</span>
                </button>

                {/* Cancel / Discard Recording */}
                <button
                  onClick={handleDiscardRecording}
                  className="p-2 text-[#991b1b] hover:bg-[#fee2e2] rounded-[16px] border-2 border-[#E35A4F] transition-colors"
                  title="Discard recording"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : voiceState === 'preview' ? (
            /* 2. Voice Message Preview Interface (Listen, Scrubber, Record Again, Delete, Send) */
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[24px] px-5 py-3 animate-in fade-in zoom-in-98 duration-150">
              <div className="flex items-center gap-3">
                {/* Play / Pause button */}
                <button
                  onClick={handleTogglePreviewPlayback}
                  className="w-10 h-10 rounded-full bg-[#202020] text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
                  title={isPlayingPreview ? 'Pause preview' : 'Listen to preview'}
                >
                  {isPlayingPreview ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  )}
                </button>

                {/* Progress bar and audio time */}
                <div className="flex flex-col min-w-36">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#202020]">
                    <span>{formatSeconds(previewCurrentTime)}</span>
                    <span className="text-[#202020]/60">/ {formatSeconds(recordingSeconds || 5)}</span>
                  </div>
                  <div className="w-full bg-[#202020]/20 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-[#202020] h-full rounded-full transition-all duration-100"
                      style={{
                        width: `${Math.min(
                          100,
                          ((previewCurrentTime || 0) / (recordingSeconds || 5)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Waveform preview graphic */}
              <div className="hidden md:flex items-center gap-1 h-6">
                {[40, 75, 45, 90, 60, 100, 50, 85, 70, 60, 95, 65, 40, 80].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full ${isPlayingPreview ? 'bg-[#202020] animate-pulse' : 'bg-[#202020]/40'}`}
                  />
                ))}
              </div>

              {/* Action Controls: Discard, Record Again, Send */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscardRecording}
                  className="p-2 text-[#991b1b] hover:bg-[#fee2e2] rounded-[16px] border-2 border-[#202020] transition-colors"
                  title="Delete voice note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    handleDiscardRecording();
                    handleStartRecording();
                  }}
                  className="px-3 py-2 bg-white text-[#202020] hover:bg-[#F4EFE7] rounded-[16px] border-2 border-[#202020] flex items-center gap-1.5 text-xs font-bold transition-all"
                  title="Record again"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Record Again</span>
                </button>

                <Button
                  variant="primary"
                  size="md"
                  className="gap-1.5 bg-[#72A4F2] text-[#202020] border-2 border-[#202020] font-bold"
                  onClick={handleSendVoiceMessage}
                  title="Send verified voice note to customer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Voice Message</span>
                </Button>
              </div>
            </div>
          ) : (
            /* 3. Standard Text Input Mode with Mic & Send buttons */
            <div className="flex items-center gap-3">
              <button
                className="p-2.5 text-[#202020] hover:bg-[#F4EFE7] rounded-[16px] border-2 border-[#202020] transition-colors"
                title="Attach document or media"
              >
                <Paperclip className="h-4 w-4" />
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
                    ? 'Type a reply or click the mic to record a voice message with pause/preview...'
                    : 'Customer service window expired. Send an approved template message to re-initiate.'
                }
                className="flex-1 text-xs border-2 border-[#202020] rounded-[20px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#72A4F2] disabled:bg-[#F4EFE7] disabled:cursor-not-allowed font-medium"
              />

              {/* Voice Message (Mic) Button */}
              <button
                onClick={handleStartRecording}
                disabled={!windowStatus.isActive}
                className={`p-2.5 rounded-[16px] border-2 border-[#202020] transition-all flex items-center justify-center ${
                  windowStatus.isActive
                    ? 'bg-[#F4EFE7] hover:bg-[#72A4F2] text-[#202020] active:scale-95'
                    : 'bg-[#F4EFE7]/50 text-[#202020]/30 cursor-not-allowed'
                }`}
                title={
                  windowStatus.isActive
                    ? 'Record WhatsApp Voice Message with Pause & Preview'
                    : 'Voice notes locked (24h customer service window expired)'
                }
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Send Text Button */}
              <Button
                variant="primary"
                size="md"
                disabled={!windowStatus.isActive || !replyText.trim()}
                className="gap-1.5"
                onClick={handleSendReply}
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Contact Context & Notes */}
      <div className="w-80 border-l-2 border-[#202020] bg-white flex flex-col shrink-0">
        <div className="p-6 border-b-2 border-[#202020] text-center bg-[#F9F6F1]">
          <div className="w-14 h-14 rounded-[18px] bg-[#72A4F2] border-2 border-[#202020] text-[#202020] font-black text-base font-serif mx-auto flex items-center justify-center">
            {selectedChat.name.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="font-bold font-serif text-sm text-[#202020] mt-2.5">{selectedChat.name}</h3>
          <p className="text-xs text-[#202020]/60 font-mono mt-0.5">{selectedChat.phone}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b-2 border-[#202020] text-xs font-bold">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-3 text-center border-b-4 ${
              activeTab === 'messages' ? 'border-[#202020] text-[#202020] bg-[#BED0F7]/30' : 'border-transparent text-[#202020]/60'
            }`}
          >
            Profile & Consent
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 text-center border-b-4 ${
              activeTab === 'notes' ? 'border-[#202020] text-[#202020] bg-[#BED0F7]/30' : 'border-transparent text-[#202020]/60'
            }`}
          >
            Internal Notes ({notes.length})
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto text-xs">
          {activeTab === 'messages' ? (
            <>
              <div>
                <span className="text-[10px] font-bold text-[#202020]/60 uppercase tracking-wider block mb-1.5">
                  Consent Verification
                </span>
                <div className="p-3.5 bg-[#ecfdf5] border-2 border-[#202020] rounded-[18px]">
                  <div className="flex items-center gap-1.5 text-[#065f46] font-bold text-xs">
                    <CheckCheck className="h-4 w-4 text-[#065f46]" />
                    Verified WhatsApp Opt-In
                  </div>
                  <p className="text-[10px] text-[#065f46]/80 mt-1 font-medium">Source: Online Checkout Checkbox</p>
                  <p className="text-[9px] text-[#065f46]/70">Captured: 12 Oct 2026 14:20 UTC</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#202020]/60 uppercase tracking-wider block mb-1.5">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChat.tags.map((t) => (
                    <Badge key={t} variant="charcoal" size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#202020]/60 uppercase tracking-wider block mb-1.5">Team Assignment</span>
                <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#202020]/60">Department:</span>
                    <span className="font-bold">{selectedChat.team}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#202020]/60">Assigned Agent:</span>
                    <span className="font-bold">{selectedChat.assignedTo}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3.5 bg-[#fef9c3] border-2 border-[#202020] rounded-[18px] text-xs text-[#854d0e]">
                  <span className="font-bold block font-serif">{note.author}:</span>
                  <p className="mt-1 font-medium leading-relaxed">{note.text}</p>
                  <span className="text-[9px] text-[#854d0e]/70 block mt-1.5 font-bold">{note.time}</span>
                </div>
              ))}

              <div className="pt-2 space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add an internal note (never visible to customer)..."
                  rows={3}
                  className="w-full text-xs p-3 border-2 border-[#202020] rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#72A4F2] font-medium"
                ></textarea>
                <Button variant="secondary" size="sm" className="w-full" onClick={handleAddNote}>
                  Add Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 border-2 border-[#202020] space-y-4">
            <h3 className="text-base font-bold font-serif text-[#202020]">Select Approved Template</h3>
            <p className="text-xs text-[#202020]/70">
              The 24-hour service window has expired. Choose an approved Meta template to re-engage this customer.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  alert('Template "customer_reengagement" dispatched to Meta Cloud API.');
                  setIsTemplateModalOpen(false);
                }}
                className="w-full text-left p-3 border-2 border-[#202020] rounded-[18px] hover:bg-[#BED0F7]/40 text-xs font-bold"
              >
                customer_reengagement (Marketing)
              </button>
              <button
                onClick={() => {
                  alert('Template "order_update" dispatched to Meta Cloud API.');
                  setIsTemplateModalOpen(false);
                }}
                className="w-full text-left p-3 border-2 border-[#202020] rounded-[18px] hover:bg-[#BED0F7]/40 text-xs font-bold"
              >
                order_update (Utility)
              </button>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setIsTemplateModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
