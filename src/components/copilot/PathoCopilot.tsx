import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Image as ImageIcon, FileText, Edit3, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChatMessage, ChatResponse } from '@/types/api';
import { sendChatMessage } from '@/lib/api';
import { useCase } from '@/contexts/CaseContext';

interface PathoCopilotProps {
    className?: string;
    onUpdateReport?: (text: string) => void;
}

interface MessageWithActions extends ChatMessage {
    actions?: ChatResponse['suggested_actions'];
}

interface SimilarCase {
    case_id: string;
    diagnosis: string;
    similarity: number;
    description: string;
    thumbnail_url?: string;
}

export function PathoCopilot({ className, onUpdateReport }: PathoCopilotProps) {
    const { caseId, patientData, analysisResult, roiResult, report, chatMessages, addChatMessage } = useCase();
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [similarCases, setSimilarCases] = useState<SimilarCase[] | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Use context messages for persistence
    const messages = chatMessages as MessageWithActions[];

    // Initial greeting - only add if no messages exist
    useEffect(() => {
        if (chatMessages.length === 0) {
            addChatMessage({
                role: 'assistant',
                content: "Hello! I'm MedGemma, your AI pathology assistant. I've analyzed the slide and patient context. How can I help refine the diagnosis or report?",
                timestamp: new Date().toISOString()
            });
        }
    }, [chatMessages.length, addChatMessage]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, similarCases]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !caseId) return;

        const userMsg: MessageWithActions = {
            role: 'user',
            content: inputValue,
            timestamp: new Date().toISOString()
        };

        addChatMessage(userMsg);
        setInputValue('');
        setIsLoading(true);
        setSimilarCases(null); // Reset previous similar cases

        try {
            // Construct context packet
            const context = {
                patient: patientData ? {
                    age: patientData.dateOfBirth,
                    gender: patientData.gender,
                    history: patientData.medicalHistory
                } : null,
                findings: analysisResult?.findings || [],
                rois: roiResult?.selected_patches.length || 0,
                current_report: report?.narrative_summary
            };

            const response = await sendChatMessage(caseId, [...messages, userMsg], context);

            const botMsg: MessageWithActions = {
                ...response.message,
                actions: response.suggested_actions
            };

            addChatMessage(botMsg);

            // Heuristic to show similar cases if user asked
            if (userMsg.content.toLowerCase().includes('similar') || userMsg.content.toLowerCase().includes('compare') || userMsg.content.toLowerCase().includes('atlas')) {
                fetchSimilarCases();
            }

        } catch (error) {
            console.error("Chat error:", error);
            addChatMessage({
                role: 'system' as const, // Cast to literal type
                content: "Sorry, I encountered an error communicating with the model.",
                timestamp: new Date().toISOString()
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSimilarCases = async () => {
        setIsLoading(true);
        try {
            // Call the new /atlas/similar endpoint
            // using fetch direct since it is not in api.ts yet fully typed
            const res = await fetch('http://127.0.0.1:8009/atlas/similar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: caseId })
            });

            if (res.ok) {
                const data = await res.json();
                setSimilarCases(data.results);
                // Add a system message saying we found them
                addChatMessage({
                    role: 'assistant',
                    content: `I found ${data.results.length} histologically similar cases in the atlas.`,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error("Atlas search failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-slate-50 border-l border-slate-200", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white shrink-0 shadow-sm">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-teal-100">
                        <AvatarImage src="/medgemma-avatar.png" />
                        <AvatarFallback className="bg-teal-600 text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-800">PathoCopilot</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] text-slate-500">Live • Context Aware</span>
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    MedGemma-2b
                </Badge>
            </div>

            {/* Context Pills */}
            <div className="px-4 py-2 border-b bg-slate-50/50 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
                {patientData && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-slate-200 text-slate-600 font-normal whitespace-nowrap">
                        <User className="w-3 h-3 mr-1 text-slate-400" />
                        Pt Context
                    </Badge>
                )}
                {roiResult && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-slate-200 text-slate-600 font-normal whitespace-nowrap">
                        <ImageIcon className="w-3 h-3 mr-1 text-slate-400" />
                        {roiResult.selected_patches.length} ROIs
                    </Badge>
                )}
                {analysisResult && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-slate-200 text-slate-600 font-normal whitespace-nowrap">
                        <FileText className="w-3 h-3 mr-1 text-slate-400" />
                        Analysis Ready
                    </Badge>
                )}
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4 pb-2">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex gap-3 max-w-[90%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <Avatar className={cn(
                                "h-8 w-8 mt-1 shadow-sm",
                                msg.role === 'user' ? "bg-slate-200" : "bg-teal-600"
                            )}>
                                {msg.role === 'user' ? (
                                    <AvatarFallback className="text-slate-600"><User className="h-4 w-4" /></AvatarFallback>
                                ) : (
                                    <AvatarFallback className="text-white bg-teal-600"><Bot className="h-4 w-4" /></AvatarFallback>
                                )}
                            </Avatar>

                            <div className={cn(
                                "rounded-2xl px-4 py-3 text-sm shadow-sm",
                                msg.role === 'user'
                                    ? "bg-slate-800 text-white rounded-tr-sm"
                                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                            )}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                <div className={cn(
                                    "text-[10px] mt-1.5 opacity-50",
                                    msg.role === 'user' ? "text-slate-300" : "text-slate-400"
                                )}>
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>

                                {/* Suggested Actions */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {msg.actions.map((action, actionIdx) => (
                                            <Button
                                                key={actionIdx}
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
                                                onClick={() => {
                                                    if (action.type === 'update_report' && onUpdateReport) {
                                                        onUpdateReport(action.payload);
                                                    }
                                                }}
                                            >
                                                <FileText className="w-3 h-3 mr-1.5" />
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Similar Cases Carousel */}
                    {similarCases && (
                        <div className="my-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    <History className="w-3 h-3 mr-1" />
                                    Comparative Atlas
                                </Badge>
                                <span className="text-xs text-slate-500">Visual RAG Matches</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 px-1 snap-x scrollbar-hide">
                                {similarCases.map((match, idx) => (
                                    <Card key={idx} className="flex-shrink-0 w-60 snap-center bg-white border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                                        <div className="h-28 bg-slate-100 relative overflow-hidden rounded-t-lg">
                                            {/* Placeholder or Thumbnail */}
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                            {/* Similarity Badge */}
                                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                {(match.similarity * 100).toFixed(0)}% Match
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-semibold text-xs text-slate-800 truncate" title={match.case_id}>
                                                {match.diagnosis}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                {match.description}
                                            </p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <Badge variant="secondary" className="h-4 text-[9px] px-1 bg-slate-100 text-slate-600">
                                                    Confirmed
                                                </Badge>
                                                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-0 hover:bg-transparent text-teal-600">
                                                    Diff &rarr;
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex gap-3 mr-auto max-w-[80%] animate-pulse">
                            <Avatar className="h-8 w-8 bg-teal-600">
                                <AvatarFallback className="text-white bg-teal-600"><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100 space-y-2 w-32 shadow-sm">
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                                <div className="h-2 bg-slate-100 rounded w-2/3"></div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="relative flex items-end gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask MedGemma..."
                        className="pr-10 py-6 resize-none focus-visible:ring-teal-500 bg-slate-50 border-slate-200"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        className={cn(
                            "absolute right-2 bottom-1.5 h-9 w-9 transition-all shadow-sm",
                            inputValue.trim() ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                        )}
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="mt-2 flex gap-2 justify-center">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-teal-600 hover:bg-transparent" onClick={() => setInputValue("Show similar cases from the atlas")}>
                        "Show similar cases"
                    </Button>
                    <div className="w-px h-3 bg-slate-200 self-center" />
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-teal-600 hover:bg-transparent" onClick={() => setInputValue("What visual evidence supports this?")}>
                        "Visual evidence?"
                    </Button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                    AI-generated findings. Always verify with visual evidence.
                </p>
            </div>
        </div>
    );
}
