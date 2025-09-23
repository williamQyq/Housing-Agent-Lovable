import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  type: "user" | "system";
  timestamp: Date;
  files?: ChatFile[];
}

interface ChatFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface ChatProps {
  className?: string;
  onMessageSend?: (message: string, files: ChatFile[]) => void;
  onRequestCreated?: (request: any) => void;
  placeholder?: string;
}

export const Chat = ({ className, onMessageSend, onRequestCreated, placeholder = "Type a message..." }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<ChatFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hello! I'm here to help you manage maintenance requests. You can describe issues and I'll help create requests automatically.",
      type: "system",
      timestamp: new Date()
    }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles: ChatFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const parseMaintenanceRequest = (content: string) => {
    const lowerContent = content.toLowerCase();
    
    // Check if this looks like a maintenance request
    const requestKeywords = ['leak', 'broken', 'not working', 'repair', 'fix', 'issue', 'problem', 'maintenance', 'heating', 'plumbing', 'electrical'];
    const isRequest = requestKeywords.some(keyword => lowerContent.includes(keyword));
    
    if (!isRequest) return null;

    // Extract urgency
    let urgency: "low" | "medium" | "high" | "urgent" = "medium";
    if (lowerContent.includes('urgent') || lowerContent.includes('emergency') || lowerContent.includes('immediately')) {
      urgency = "urgent";
    } else if (lowerContent.includes('high') || lowerContent.includes('asap') || lowerContent.includes('quickly')) {
      urgency = "high";  
    } else if (lowerContent.includes('low') || lowerContent.includes('when possible') || lowerContent.includes('eventually')) {
      urgency = "low";
    }

    // Extract category
    let category = "other";
    if (lowerContent.includes('leak') || lowerContent.includes('plumb') || lowerContent.includes('water') || lowerContent.includes('sink') || lowerContent.includes('toilet')) {
      category = "plumbing";
    } else if (lowerContent.includes('heat') || lowerContent.includes('hvac') || lowerContent.includes('air') || lowerContent.includes('temperature')) {
      category = "hvac";
    } else if (lowerContent.includes('light') || lowerContent.includes('electrical') || lowerContent.includes('power') || lowerContent.includes('outlet')) {
      category = "electrical";
    } else if (lowerContent.includes('appliance') || lowerContent.includes('refrigerator') || lowerContent.includes('stove') || lowerContent.includes('washer')) {
      category = "appliances";
    } else if (lowerContent.includes('wall') || lowerContent.includes('ceiling') || lowerContent.includes('floor') || lowerContent.includes('door') || lowerContent.includes('window')) {
      category = "structural";
    }

    return {
      id: `REQ${Date.now()}`,
      description: content,
      urgency,
      category,
      status: "open" as const,
      date: new Date().toISOString().split('T')[0],
      files: files.length > 0 ? files : undefined
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content: message,
      type: "user",
      timestamp: new Date(),
      files: files.length > 0 ? [...files] : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    onMessageSend?.(message, files);

    // Check if this message creates a maintenance request
    const request = parseMaintenanceRequest(message);
    if (request && onRequestCreated) {
      onRequestCreated(request);
      
      // Add system response
      setTimeout(() => {
        const systemResponse: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          content: `I've created a maintenance request for you! Request ID: ${request.id}`,
          type: "system", 
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemResponse]);
      }, 500);
    }

    setMessage("");
    setFiles([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('text') || type.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Card className={cn("flex flex-col h-[500px]", className)}>
      <CardContent className="flex flex-col h-full p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex animate-fade-in",
                  msg.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    msg.type === "user" 
                      ? "bg-primary text-primary-foreground ml-4" 
                      : "bg-muted mr-4"
                  )}
                >
                  <p>{msg.content}</p>
                  {msg.files && msg.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.files.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 text-xs opacity-90">
                          {getFileIcon(file.type)}
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* File Upload Area */}
        {files.length > 0 && (
          <div className="border-t p-3 bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <Badge key={file.id} variant="secondary" className="flex items-center gap-1 pr-1">
                  {getFileIcon(file.type)}
                  <span className="truncate max-w-24">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div 
          className={cn(
            "border-t p-4 bg-background transition-colors",
            isDragging && "bg-muted border-primary"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" disabled={!message.trim() && files.length === 0}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
              <p className="text-primary font-medium">Drop files here to upload</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};