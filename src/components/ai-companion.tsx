'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string; sources?: string[] };
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const starterMessage: ChatMessage = {
  role: 'assistant',
  content: 'Halo! Saya Asisten Desa Bawangan. Saya bisa membantu mencari informasi desa, memahami persyaratan layanan, dan menemukan dokumen publik. Silakan bertanya lewat chat atau suara.',
};

export default function AICompanion() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [learningConsent, setLearningConsent] = useState(false);
  const [notice, setNotice] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }, []);

  function startVoiceInput() {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice('Fitur pengenalan suara belum didukung browser ini. Silakan gunakan chat atau buka dengan browser yang mendukung mikrofon.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setInput((current) => current ? current + ' ' + transcript : transcript);
    };
    recognition.onerror = () => {
      setNotice('Suara belum berhasil dikenali. Periksa izin mikrofon, lalu coba lagi.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setNotice('');
    setListening(true);
    try { recognition.start(); } catch { setListening(false); setNotice('Mikrofon belum siap. Coba kembali.'); }
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) {
      setNotice('Suara keluaran tidak didukung browser ini. Jawaban tetap tersedia dalam bentuk teks.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('id'));
    if (indonesianVoice) utterance.voice = indonesianVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);
    setNotice('');
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) throw new Error('Konfigurasi layanan belum tersedia.');
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-companion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({
          question,
          history: messages.slice(-8).map(({ role, content }) => ({ role, content })),
          learningConsent,
          pagePath: window.location.pathname,
        }),
      });
      const payload = await response.json().catch(() => ({})) as { answer?: string; sources?: string[]; error?: string };
      if (!response.ok || !payload.answer) throw new Error(payload.error || 'Asisten sedang tidak tersedia. Silakan coba lagi beberapa saat.');
      const answer: ChatMessage = { role: 'assistant', content: payload.answer, sources: payload.sources ?? [] };
      setMessages((current) => [...current, answer]);
      setLearningConsent(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Koneksi ke Asisten Desa Bawangan belum tersedia.';
      setNotice(message.includes('Failed to fetch') ? 'Layanan AI belum terhubung. Backend AI perlu diaktifkan terlebih dahulu.' : message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-companion-root">
      {open && (
        <section className="ai-companion-panel" aria-label="Asisten AI Desa Bawangan">
          <header className="ai-companion-header">
            <div className="ai-companion-identity">
              <div className={`ai-companion-avatar ${speaking ? 'is-speaking' : listening ? 'is-listening' : busy ? 'is-thinking' : ''}`} aria-hidden="true">
                <span className="ai-avatar-orbit" />
                <img className="ai-avatar-logo" src="https://commons.wikimedia.org/wiki/Special:FilePath/Seal_of_Jombang_Regency.svg" alt="Lambang Kabupaten Jombang" />
                <span className="ai-equalizer">{Array.from({ length: 7 }, (_, index) => <i key={index} style={{ animationDelay: `${index * 85}ms` }} />)}</span>
              </div>
              <div><strong>Asisten Desa Bawangan</strong><small>{listening ? 'Mendengarkan…' : speaking ? 'Sedang berbicara…' : busy ? 'Sedang mencari jawaban…' : 'Pendamping layanan masyarakat'}</small></div>
            </div>
            <button className="ai-companion-close" type="button" onClick={() => { setOpen(false); setListening(false); recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); setSpeaking(false); }} aria-label="Tutup asisten">×</button>
          </header>
          <div className="ai-companion-intro">Tanyakan informasi dan layanan resmi desa. Periksa sumber sebelum menggunakan informasi untuk keputusan penting.</div>
          <div className="ai-companion-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`ai-chat-row ${message.role}`} key={`${message.role}-${index}`}>
                <div className="ai-chat-bubble">
                  {message.content}
                  {message.sources && message.sources.length > 0 && <div className="ai-chat-sources"><strong>Sumber informasi</strong>{message.sources.map((source) => <span key={source}>{source}</span>)}</div>}
                  {message.role === 'assistant' && index > 0 && <button type="button" className="ai-speak-button" onClick={() => speak(message.content)} aria-label="Dengarkan jawaban">▶ Dengarkan</button>}
                </div>
              </div>
            ))}
            {busy && <div className="ai-chat-row assistant"><div className="ai-chat-bubble ai-typing"><i /><i /><i /><span>Mencari informasi…</span></div></div>}
            <div ref={bottomRef} />
          </div>
          {notice && <div className="ai-companion-notice" role="status">{notice}</div>}
          <label className="ai-learning-consent"><input type="checkbox" checked={learningConsent} onChange={(event) => setLearningConsent(event.target.checked)} /> Izinkan pertanyaan ini disimpan setelah penyamaran data pribadi untuk membantu peningkatan layanan (opsional).</label>
          <form className="ai-companion-composer" onSubmit={sendMessage}>
            <button className={`ai-voice-button ${listening ? 'active' : ''}`} type="button" onClick={startVoiceInput} aria-label={listening ? 'Hentikan mikrofon' : 'Gunakan mikrofon'} title={listening ? 'Hentikan mikrofon' : 'Gunakan mikrofon'}>{listening ? '■' : '🎙'}</button>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pertanyaan…" aria-label="Pertanyaan untuk asisten" maxLength={1200} />
            <button className="ai-send-button" type="submit" disabled={busy || !input.trim()} aria-label="Kirim pertanyaan">➤</button>
          </form>
          <footer className="ai-companion-footer">Jangan kirim NIK, kata sandi, atau data pribadi sensitif. Jawaban AI dapat keliru.</footer>
        </section>
      )}
      <button className={`ai-companion-launcher ${open ? 'open' : ''}`} type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Tutup Asisten Desa Bawangan' : 'Buka Asisten Desa Bawangan'}>
        <span className={`ai-launcher-mark ${speaking || listening || busy ? 'active' : ''}`}><img src="https://commons.wikimedia.org/wiki/Special:FilePath/Seal_of_Jombang_Regency.svg" alt="" /><i /><i /><i /><i /><i /></span>
        <span>{open ? 'Tutup Asisten' : 'Tanya AI Desa'}</span>
      </button>
    </div>
  );
}
