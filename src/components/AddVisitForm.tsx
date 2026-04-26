'use client';

import { useState, useRef } from 'react';
import { Button, Input, Card } from './ui';
import { ClipboardList, Stethoscope, Image, Send, AlertCircle, Mic, MicOff, Activity, Sparkles, Loader2 } from 'lucide-react';
import { createVisit } from '@/actions/visit';
import { correctMedicalText } from '@/actions/ai';
import { cn } from './ui';

import { Settings } from '@/types';

interface AddVisitFormProps {
    patientId: string;
    settings: Settings;
}

export function AddVisitForm({ patientId, settings }: AddVisitFormProps) {
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState<'diagnosis' | 'treatment' | null>(null);
    const [isAILoading, setIsAILoading] = useState<'diagnosis' | 'treatment' | null>(null);
    const [aiSuccessFlash, setAiSuccessFlash] = useState<'diagnosis' | 'treatment' | null>(null);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [sttLang, setSttLang] = useState<'ar-SA' | 'en-US'>('ar-SA');
    const [audioLevel, setAudioLevel] = useState(0);
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Common medical terms normalization for better accuracy
    const normalizeMedicalText = (text: string, lang: string) => {
        if (lang !== 'en-US') return text;
        let processed = text.toLowerCase();
        
        const medicalDictionary: Record<string, string> = {
            'panadol': 'Panadol',
            'paracetamol': 'Paracetamol',
            'amoxicillin': 'Amoxicillin',
            'augmentin': 'Augmentin',
            'pneumonia': 'Pneumonia',
            'hypertension': 'Hypertension',
            'diabetes': 'Diabetes',
            'gastritis': 'Gastritis',
            'tonsillitis': 'Tonsillitis',
            'bronchitis': 'Bronchitis',
            'infection': 'Infection',
            'inflammation': 'Inflammation',
            'diagnosis': 'Diagnosis',
            'treatment': 'Treatment',
            'tablet': 'Tablet',
            'capsule': 'Capsule',
            'mg': 'mg',
            'ml': 'ml',
            'daily': 'daily',
            'before food': 'before food',
            'after food': 'after food',
            'bid': 'BID (twice daily)',
            'tid': 'TID (three times daily)',
            'qid': 'QID (four times daily)',
            'stat': 'STAT (immediately)',
            'prn': 'PRN (as needed)'
        };

        Object.keys(medicalDictionary).forEach(key => {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            processed = processed.replace(regex, medicalDictionary[key]);
        });

        return processed.charAt(0).toUpperCase() + processed.slice(1);
    };

    const toggleLanguage = () => {
        const newLang = sttLang === 'ar-SA' ? 'en-US' : 'ar-SA';
        setSttLang(newLang);
        
        if (isListening && recognitionRef.current) {
            const currentField = isListening;
            recognitionRef.current.onend = null; 
            recognitionRef.current.stop();
            setTimeout(() => startSpeechRecognition(currentField, newLang), 200);
        }
    };

    const formatTranscript = (text: string, lang: string) => {
        const trimmed = text.trim();
        if (lang === 'en-US') {
            return normalizeMedicalText(trimmed, lang);
        }
        return trimmed;
    };

    const startAudioVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const source = audioContext.createMediaStreamSource(stream);
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);

            audioContextRef.current = audioContext;
            analyzerRef.current = analyzer;

            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateLevel = () => {
                if (!analyzerRef.current) return;
                analyzerRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                setAudioLevel(average);
                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
        } catch (err) {
            console.error('Mic Access Error:', err);
        }
    };

    const stopAudioVisualizer = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
            try {
                audioContextRef.current.close();
            } catch(e) {}
        }
        setAudioLevel(0);
    };

    const startSpeechRecognition = (field: 'diagnosis' | 'treatment', forcedLang?: 'ar-SA' | 'en-US') => {
        const activeLang = forcedLang || sttLang;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('عذراً، متصفحك لا يدعم نظام الإملاء الصوتي المتقدم.');
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.onend = null;
                    recognitionRef.current.onerror = null;
                    recognitionRef.current.stop();
                } catch (e) {}
            }
            setIsListening(null);
            stopAudioVisualizer();
            recognitionRef.current = null;
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            
            recognition.lang = activeLang;
            recognition.continuous = true; 
            recognition.interimResults = true; 
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(field);
                setInterimTranscript('');
                startAudioVisualizer();
            };

            recognition.onresult = (event: any) => {
                let finalResult = '';
                let interimResult = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalResult += event.results[i][0].transcript;
                    } else {
                        interimResult += event.results[i][0].transcript;
                    }
                }

                if (finalResult) {
                    const formattedResult = formatTranscript(finalResult, activeLang);
                    if (field === 'diagnosis') {
                        setDiagnosis(prev => prev + (prev ? (activeLang === 'en-US' ? '. ' : ' ') : '') + formattedResult);
                    } else {
                        setTreatment(prev => prev + (prev ? (activeLang === 'en-US' ? '. ' : ' ') : '') + formattedResult);
                    }
                    setInterimTranscript('');
                } else {
                    setInterimTranscript(interimResult);
                }
            };

            recognition.onerror = (event: any) => {
                const err = event.error;
                console.error('STT Error:', err);
                
                // Transient errors that we can ignore or handle gracefully
                if (err === 'no-speech' || err === 'aborted') {
                    return; 
                }

                if (err === 'not-allowed') {
                    setError('يرجى السماح بالوصول للميكروفون من إعدادات المتصفح.');
                } else if (err === 'network') {
                    setError('حدث خطأ في الاتصال بالسيرفر الصوتي. يرجى التأكد من استقرار الإنترنت والمحاولة مرة أخرى.');
                } else {
                    setError(`خطأ في النظام: ${err}`);
                }
                
                setIsListening(null);
                stopAudioVisualizer();
                recognitionRef.current = null;
            };

            recognition.onend = () => {
                // Only reset state if we are still marked as listening (meaning it stopped unexpectedly)
                if (recognitionRef.current) {
                    setIsListening(null);
                    setInterimTranscript('');
                    recognitionRef.current = null;
                    stopAudioVisualizer();
                }
            };

            recognition.start();
        } catch (e) {
            console.error('STT Init Error:', e);
            setIsListening(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!diagnosis.trim() || !treatment.trim()) {
            setError('يرجى ملء تفاصيل التشخيص والعلاج لإتمام العملية');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let imagePath = '';
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                if (uploadData.path) {
                    imagePath = uploadData.path;
                }
            }

            await createVisit({
                patientId,
                diagnosis: diagnosis.trim(),
                treatment: treatment.trim(),
                notes: notes.trim(),
                imagePath,
            });

            setDiagnosis('');
            setTreatment('');
            setNotes('');
            setFile(null);
        } catch (err) {
            setError('حدث خطأ غير متوقع أثناء الحفظ.');
        } finally {
            setLoading(false);
        }
    };

    const handleAIEnhance = async (field: 'diagnosis' | 'treatment') => {
        const textToProcess = field === 'diagnosis' ? diagnosis : treatment;
        if (!textToProcess.trim()) return;

        try {
            setIsAILoading(field);
            setError('');
            const correctedText = await correctMedicalText(textToProcess);
            
            if (field === 'diagnosis') {
                setDiagnosis(correctedText);
            } else {
                setTreatment(correctedText);
            }
            
            setAiSuccessFlash(field);
            setTimeout(() => setAiSuccessFlash(null), 1500); // UI visual feedback
        } catch (err: any) {
            console.error('AI Error:', err);
            setError('تعذر الاتصال بالذكاء الاصطناعي لتصحيح النص. قم بمراجعة مفتاح API.');
        } finally {
            setIsAILoading(null);
        }
    };

    const handleAppend = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, value: string) => {
        if (current.trim()) {
            setter(current + '\n' + value);
        } else {
            setter(value);
        }
    };

    const diagnosisList = settings.commonDiagnoses ? settings.commonDiagnoses.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const treatmentList = settings.commonTreatments ? settings.commonTreatments.split('\n').map(s => s.trim()).filter(Boolean) : [];

    return (
        <Card className="border-l-4 border-l-primary p-10">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <ClipboardList size={24} />
                </div>
                <div className="text-right">
                    <h3 className="text-xl font-black text-slate-900">إضافة زيارة جديدة</h3>
                    <p className="text-sm text-slate-400 font-bold">تسجيل التشخيص والعلاج الموصوف</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="relative text-right group">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-slate-700 block mr-1">التشخيص الطبي للمريض</label>
                            
                            <div className="flex gap-2 flex-row-reverse items-center">
                                <button
                                    type="button"
                                    onClick={toggleLanguage}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-xs font-black transition-all uppercase border shadow-sm flex items-center gap-2",
                                        sttLang === 'ar-SA' 
                                            ? "bg-primary text-white border-primary" 
                                            : "bg-blue-600 text-white border-blue-700 shadow-blue-100"
                                    )}
                                >
                                    <span className="opacity-70">{sttLang === 'ar-SA' ? 'العربية' : 'English'}</span>
                                    <div className="w-[1px] h-3 bg-white/30" />
                                    <span>{sttLang === 'ar-SA' ? 'AR' : 'EN'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAIEnhance('diagnosis')}
                                    disabled={!diagnosis.trim() || isAILoading !== null}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2",
                                        !diagnosis.trim() ? "bg-slate-50 text-slate-300 cursor-not-allowed" : 
                                        isAILoading === 'diagnosis' ? "bg-purple-100 text-purple-600" :
                                        "bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-100 hover:border-purple-600 shadow-sm disabled:opacity-50"
                                    )}
                                    title="تصحيح وتحسين النص بالذكاء الاصطناعي"
                                >
                                    {isAILoading === 'diagnosis' ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => startSpeechRecognition('diagnosis')}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                                        isListening === 'diagnosis' 
                                            ? "bg-red-500 text-white shadow-lg shadow-red-200" 
                                            : "bg-white text-slate-400 hover:text-primary border border-slate-100 shadow-sm active:scale-95"
                                    )}
                                >
                                    {isListening === 'diagnosis' ? (
                                        <>
                                            <MicOff size={18} className="relative z-10" />
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 bg-white/20 transition-all duration-75"
                                                style={{ height: `${Math.min(audioLevel * 3, 100)}%` }}
                                            />
                                        </>
                                    ) : (
                                        <Mic size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <textarea
                            dir={sttLang === 'ar-SA' ? 'rtl' : 'ltr'}
                            className={cn(
                                "w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2.5xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 focus:bg-white transition-all duration-500 pr-12 min-h-[140px] font-medium placeholder:text-slate-300",
                                sttLang === 'ar-SA' ? "text-right font-arabic" : "text-left font-sans",
                                aiSuccessFlash === 'diagnosis' ? "bg-emerald-50/70 border-emerald-300 ring-4 ring-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-emerald-900" : ""
                            )}
                            placeholder={sttLang === 'ar-SA' ? "اكتب التشخيص التفصيلي هنا..." : "Type diagnosis details here..."}
                            value={diagnosis + (isListening === 'diagnosis' && interimTranscript ? ` (${interimTranscript})` : '')}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            disabled={loading}
                        />
                        <Stethoscope size={20} className="absolute right-4 top-[3.7rem] text-slate-400 group-focus-within:text-primary transition-colors" />
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                            {diagnosisList.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAppend(setDiagnosis, diagnosis, item)}
                                    className="px-3 py-1.5 bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-600 rounded-xl text-xs font-bold border border-slate-200/50"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative text-right group">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-slate-700 block mr-1">العلاج والوصفة الطبية</label>
                            
                            <div className="flex gap-2 flex-row-reverse items-center">
                                <button
                                    type="button"
                                    onClick={toggleLanguage}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-xs font-black transition-all uppercase border shadow-sm flex items-center gap-2",
                                        sttLang === 'ar-SA' 
                                            ? "bg-primary text-white border-primary" 
                                            : "bg-blue-600 text-white border-blue-700 shadow-blue-100"
                                    )}
                                >
                                    <span className="opacity-70">{sttLang === 'ar-SA' ? 'العربية' : 'English'}</span>
                                    <div className="w-[1px] h-3 bg-white/30" />
                                    <span>{sttLang === 'ar-SA' ? 'AR' : 'EN'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAIEnhance('treatment')}
                                    disabled={!treatment.trim() || isAILoading !== null}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2",
                                        !treatment.trim() ? "bg-slate-50 text-slate-300 cursor-not-allowed" : 
                                        isAILoading === 'treatment' ? "bg-purple-100 text-purple-600" :
                                        "bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-100 hover:border-purple-600 shadow-sm disabled:opacity-50"
                                    )}
                                    title="تصحيح وتنسيق الأدوية بالذكاء الاصطناعي"
                                >
                                    {isAILoading === 'treatment' ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => startSpeechRecognition('treatment')}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                                        isListening === 'treatment' 
                                            ? "bg-red-500 text-white shadow-lg shadow-red-200" 
                                            : "bg-white text-slate-400 hover:text-primary border border-slate-100 shadow-sm active:scale-95"
                                    )}
                                >
                                    {isListening === 'treatment' ? (
                                        <>
                                            <MicOff size={18} className="relative z-10" />
                                            <div 
                                                className="absolute bottom-0 left-0 right-0 bg-white/20 transition-all duration-75"
                                                style={{ height: `${Math.min(audioLevel * 3, 100)}%` }}
                                            />
                                        </>
                                    ) : (
                                        <Mic size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <textarea
                            dir={sttLang === 'ar-SA' ? 'rtl' : 'ltr'}
                            className={cn(
                                "w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-2.5xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 focus:bg-white transition-all duration-500 pr-12 min-h-[140px] font-black font-arabic text-lg placeholder:text-slate-300",
                                sttLang === 'ar-SA' ? "text-right font-arabic" : "text-left font-sans",
                                aiSuccessFlash === 'treatment' ? "bg-emerald-50/70 border-emerald-300 ring-4 ring-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-emerald-900" : ""
                            )}
                            placeholder={sttLang === 'ar-SA' ? "قائمة الأدوية والجرعات..." : "List drugs and dosages..."}
                            value={treatment + (isListening === 'treatment' && interimTranscript ? ` (${interimTranscript})` : '')}
                            onChange={(e) => setTreatment(e.target.value)}
                            disabled={loading}
                        />
                        <ClipboardList size={20} className="absolute right-4 top-[3.7rem] text-slate-400 group-focus-within:text-primary transition-colors" />

                        <div className="flex flex-wrap gap-2 mt-3">
                            {treatmentList.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAppend(setTreatment, treatment, item)}
                                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 hover:text-teal-700 text-slate-600 rounded-xl text-xs font-bold border border-teal-100/50"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isListening && (
                        <div className="flex flex-col items-center gap-2 justify-center py-6 bg-primary/5 rounded-[2rem] border border-primary/10 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1 items-end h-4">
                                    <div className="w-1 bg-primary rounded-full animate-pulse" style={{ height: '60%' }} />
                                    <div className="w-1 bg-primary rounded-full animate-pulse delay-75" style={{ height: '100%' }} />
                                    <div className="w-1 bg-primary rounded-full animate-pulse delay-150" style={{ height: '40%' }} />
                                </div>
                                <span className="text-sm font-black text-primary uppercase tracking-widest">
                                    Listening Mode: {sttLang === 'ar-SA' ? 'العربية' : 'English'}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400">تحدث الآن، النظام يسجل بدقة عالية</p>
                        </div>
                    )}

                    <div className="text-right">
                        <Input
                            label="ملاحظات الطبيب (اختياري)"
                            placeholder="أي ملاحظات إضافية للمتابعة..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2 text-right">
                        <label className="text-sm font-bold text-slate-700 block mr-1">المرفقات والتقارير</label>
                        <div className="relative">
                            <label className={cn(
                                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300",
                                file
                                    ? "bg-teal-50/50 border-teal-200"
                                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                            )}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Image className={cn("w-10 h-10 mb-3", file ? "text-teal-500" : "text-slate-300")} />
                                    <p className="text-sm font-bold text-slate-500 px-6 text-center">
                                        {file ? <span className="text-teal-700 italic">{file.name}</span> : 'اضغط لاختيار صورة التقرير أو الأشعة'}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    accept="image/*"
                                    disabled={loading}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <Button type="submit" isLoading={loading} className="w-full h-16 text-xl rounded-2.5xl shadow-xl shadow-primary/20">
                    <span>تأكيد وحفظ الزيارة</span>
                    <Send size={24} className="-rotate-45" />
                </Button>
            </form>
        </Card>
    );
}
