"use client";

import { useEffect, useRef, useState } from "react";
import { api, ChatMessage, PartialNdaFields } from "@/lib/api";
import { NdaFormData } from "@/lib/types";

interface Props {
  formData: NdaFormData;
  onChange: (data: NdaFormData) => void;
}

const VALID_MNDA_TERM = new Set(["expires", "until_terminated"]);
const VALID_CONF_TERM = new Set(["expires", "perpetuity"]);

/** Merge non-null AI fields into existing formData, validating enum fields. */
function mergeFields(current: NdaFormData, fields: PartialNdaFields): NdaFormData {
  const merged = { ...current };
  for (const key of Object.keys(fields) as (keyof PartialNdaFields)[]) {
    const val = fields[key];
    if (val == null || val === "") continue;
    if (key === "mndaTermType" && !VALID_MNDA_TERM.has(val)) continue;
    if (key === "confidentialityTermType" && !VALID_CONF_TERM.has(val)) continue;
    (merged as Record<string, string>)[key] = val;
  }
  return merged;
}

export default function NdaChat({ formData, onChange }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  // Keep a ref to the latest formData to avoid stale closure in sendToAI
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send an opening greeting from the AI on first load
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    sendToAI([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendToAI(history: ChatMessage[]) {
    setLoading(true);
    setError("");
    try {
      const res = await api.chat(history);
      const assistantMsg: ChatMessage = { role: "assistant", content: res.reply };
      setMessages((prev) => [...prev, assistantMsg]);
      onChange(mergeFields(formDataRef.current, res.fields));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    await sendToAI(nextMessages);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 pb-3 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-base font-semibold" style={{ color: "#032147" }}>
          AI Assistant
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
          Chat to fill in your Mutual NDA
        </p>
      </div>

      {/* Message list — flex-1 + min-h-0 allows overflow-y-auto to scroll */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
              style={msg.role === "user" ? { backgroundColor: "#209dd7" } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Type a message… (Enter to send)"
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
            style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#753991" }}
            aria-label="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
