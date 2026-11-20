import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, UploadCloud, LoaderCircle, AudioLines } from 'lucide-react';

const MAX_SIZE = 10 * 1024 * 1024;
function blobAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(new Error('No se pudo leer el audio.'));
    r.readAsDataURL(file);
  });
}

export const VoiceCapture: React.FC<{ onTranscript: (text: string) => void }> = ({ onTranscript }) => {
  const [recording, setRecording] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function stop() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (durationRef.current) clearTimeout(durationRef.current);
    setRecording(false);
  }
  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (durationRef.current) clearTimeout(durationRef.current);
  }, []);
  async function start() {
    setError(''); setAudio(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Tu navegador no permite grabar audio. Puedes cargar una nota de voz.'); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = ['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const recorded = new Blob(chunks, { type: (recorder.mimeType || 'audio/webm').split(';')[0] });
        if (recorded.size > MAX_SIZE) setError('Audio demasiado largo. Usa un mensaje de menos de 10 MB.');
        else setAudio(recorded);
        stream.getTracks().forEach(track => track.stop());
        setRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start(); setRecording(true);
      durationRef.current = setTimeout(stop, 60_000);
    } catch { setError('No se obtuvo permiso de micrófono. Comprueba la configuración del navegador.'); }
  }
  async function transcribe() {
    if (!audio || busy) return;
    setError(''); setBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);
      try {
        const response = await fetch('/api/assistant/transcribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mimeType: (audio.type || 'audio/webm').split(';')[0], base64: await blobAsBase64(audio) }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo transcribir el audio.');
        if (!data.transcript?.trim()) throw new Error('El audio no contiene texto reconocible.');
        onTranscript(data.transcript); setAudio(null);
      } finally { clearTimeout(timeout); }
    } catch (e: any) { setError(e.name === 'AbortError' ? 'La transcripción tardó demasiado. Intenta de nuevo.' : String(e.message || 'Error de transcripción.')); }
    finally { setBusy(false); }
  }
  return <section aria-label="Notas de voz" className="px-4 py-2 bg-white border-t border-slate-100">
    <div className="flex flex-wrap gap-2 items-center">
      <button type="button" disabled={busy} onClick={recording ? stop : start} className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 ${recording ? 'bg-rose-100 text-rose-800':'bg-[#F0F2F2] text-slate-700'}`}>{recording ? <MicOff size={16}/> : <Mic size={16}/>} {recording ? 'Detener grabación' : 'Grabar nota de voz'}</button>
      <label className="text-xs font-bold text-slate-700 rounded-xl bg-[#F0F2F2] px-3 py-2 cursor-pointer inline-flex items-center gap-2"><UploadCloud size={16}/> Subir audio<input type="file" accept="audio/webm,audio/mp4,audio/mpeg,audio/wav,audio/ogg" className="sr-only" onChange={e=>{const f=e.target.files?.[0];if(f){if(f.size>MAX_SIZE) setError('El archivo supera 10 MB.');else{setAudio(f);setError('');}}}}/></label>
      {audio && <button disabled={busy} type="button" onClick={transcribe} className="bg-[#E2FE52] px-3 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1">{busy ? <LoaderCircle size={15} className="animate-spin"/> : <AudioLines size={15}/>} Transcribir ({Math.ceil(audio.size/1024)} KB)</button>}
    </div>
    {error && <p role="alert" className="text-rose-700 text-xs mt-2">{error}</p>}
    <p className="text-[11px] text-slate-400 mt-1">Revisa la transcripción antes de enviarla al asistente. El audio se procesa con Gemini.</p>
  </section>;
};
