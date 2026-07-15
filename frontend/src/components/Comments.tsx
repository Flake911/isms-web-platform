'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Trash2, User } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  content: string;
  createdAt: string;
}

interface Props {
  module: string;
  recordId: string;
}

export default function CommentsSection({ module, recordId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();

  const fetch_ = useCallback(async () => {
    try {
      const data = await apiGet<Comment[]>(`/comments?module=${module}&recordId=${encodeURIComponent(recordId)}`);
      setComments(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [module, recordId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await apiPost('/comments', {
        module,
        recordId,
        content: text.trim(),
        userName: user ? `${user.firstName} ${user.lastName}` : undefined,
      });
      setText('');
      fetch_();
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/comments/${id}`); fetch_(); } catch (e) { console.error(e); }
  };

  const canDelete = (c: Comment) =>
    user?.role === 'Super Admin' || user?.role === 'Organization Admin' || c.userEmail === user?.email;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
          Comments {comments.length > 0 && `(${comments.length})`}
        </span>
      </div>

      <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-text-muted text-center py-3">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-text-muted/40 text-center py-4">No comments yet — be the first</p>
        ) : comments.map(c => (
          <div key={c.id} className="group flex gap-2.5 bg-bg/60 rounded-lg px-3 py-2.5 border border-border/30">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-3 h-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-text-secondary">
                  {c.userName || c.userEmail || 'User'}
                </span>
                <span className="text-[10px] text-text-muted/50">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed break-words">{c.content}</p>
            </div>
            {canDelete(c) && (
              <button
                onClick={() => handleDelete(c.id)}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-text-muted hover:text-danger transition-all shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-1.5 text-xs bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim() || posting}
          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
        >
          <Send className="w-3 h-3" />
          Post
        </button>
      </form>
    </div>
  );
}
