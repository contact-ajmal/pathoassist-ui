
import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Image as ImageIcon, FileText } from 'lucide-react';
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

interface ChatInterfaceProps {
    className?: string;
    onUpdateReport?: (text: string) => void;
}

interface MessageWithActions extends ChatMessage {
    actions?: ChatResponse['suggested_actions'];
}

export function ChatInterface({ className, onUpdateReport }: ChatInterfaceProps) {
    const { caseId, patientData, analysisResult, roiResult, report, chatMessages, addChatMessage, setChatMessages } = useCase();
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Use context messages for persistence
    const messages = chatMessages as MessageWithActions[];

    // Initial greeting - only add if no messages exist
    useEffect(() => {
        if (chatMessages.length === 0) {
            addChatMessage({
                role: 'assistant',
                content: "Hello! I'm Google MedGemma, your AI pathology assistant. I've analyzed the slide and patient context. How can I help refine the diagnosis or report?",
                timestamp: new Date().toISOString()
            });
        }
    }, [chatMessages.length, addChatMessage]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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

        try {
            // Construct context packet
            const context = {
                patient: patientData ? {
                    age: patientData.dateOfBirth, // simplified
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

        } catch (error) {
            console.error("Chat error:", error);
            addChatMessage({
                role: 'system' as const,
                content: "Sorry, I encountered an error communicating with the model.",
                timestamp: new Date().toISOString()
            });
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
        <div className={cn("flex flex-col h-full bg-slate-50", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-teal-100">
                        <AvatarImage src="/medgemma-avatar.png" />
                        <AvatarFallback className="bg-teal-600 text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-800">Google MedGemma Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] text-slate-500">Online • Multimodal Active</span>
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Google MedGemma-1.5
                </Badge>
            </div>

            {/* Context Pills (Visual indicators of what model sees) */}
            <div className="px-4 py-2 border-b bg-slate-50/50 flex gap-2 overflow-x-auto shrink-0">
                {patientData && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-slate-200 text-slate-600 font-normal">
                        <User className="w-3 h-3 mr-1 text-slate-400" />
                        Pt Context
                    </Badge>
                )}
                {roiResult && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-slate-200 text-slate-600 font-normal">
                        <ImageIcon className="w-3 h-3 mr-1 text-slate-400" />
                        {roiResult.selected_patches.length} ROIs
                    </Badge>
                )}
                {analysisResult && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-slate-200 text-slate-600 font-normal">
                        <FileText className="w-3 h-3 mr-1 text-slate-400" />
                        Initial Analysis
                    </Badge>
                )}
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex gap-3 max-w-[90%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <Avatar className={cn(
                                "h-8 w-8 mt-1",
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
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {/* Suggested Actions */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {msg.actions.map((action, actionIdx) => (
                                            <Button
                                                key={actionIdx}
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
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
                    {isLoading && (
                        <div className="flex gap-3 mr-auto max-w-[80%] animate-pulse">
                            <Avatar className="h-8 w-8 bg-teal-600">
                                <AvatarFallback className="text-white bg-teal-600"><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100 space-y-2 w-32">
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                                <div className="h-2 bg-slate-100 rounded w-2/3"></div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t mt-auto shrink-0">
                <div className="relative flex items-end gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Google MedGemma about findings or report..."
                        className="pr-10 py-6 resize-none focus-visible:ring-teal-500"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        className={cn(
                            "absolute right-2 bottom-1.5 h-9 w-9 transition-all",
                            inputValue.trim() ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                        )}
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    Google MedGemma can make mistakes. Verify critical findings.
                </p>
            </div>
        </div>
    );
}
