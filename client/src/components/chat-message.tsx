import { Message } from "@/shared/schema";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, Bot, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  // Clean asterisks and markdown formatting while preserving tables
  const cleanMarkdownFormatting = (content: string) => {
    // Check if content contains table formatting (lines with |)
    const hasTable = content.includes('|') && content.split('\n').some(line => 
      line.trim().includes('|') && line.split('|').length > 2
    );
    
    if (hasTable) {
      // For table content, only remove asterisks from within cells, preserve table structure
      return content
        // Remove bold/italic asterisks but preserve table pipes
        .replace(/\*{1,3}([^*|]+)\*{1,3}/g, '$1')
        // Remove bold/italic underscores but preserve table structure
        .replace(/_{1,3}([^_|]+)_{1,3}/g, '$1')
        // Remove strikethrough tildes
        .replace(/~{1,2}([^~|]+)~{1,2}/g, '$1');
    } else {
      // For non-table content, clean normally
      return content
        // Remove bold/italic asterisks
        .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
        // Remove bold/italic underscores
        .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
        // Remove strikethrough tildes
        .replace(/~{1,2}([^~]+)~{1,2}/g, '$1')
        // Clean up any remaining isolated asterisks
        .replace(/\*/g, '');
    }
  };

  // Format message content with better rendering
  const formatContent = (content: string) => {
    // Clean markdown formatting first
    let formattedContent = cleanMarkdownFormatting(content);
    
    // Handle code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;

    // Handle markdown tables
    const tableRegex = /(\|.*\|[\r\n]+\|[-\s|:]+\|[\r\n]+((\|.*\|[\r\n]*)+))/g;
    formattedContent = formattedContent.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 2) return match;
      
      const headerRow = lines[0];
      const separatorRow = lines[1];
      const dataRows = lines.slice(2);
      
      // Parse header
      const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
      
      // Parse data rows
      const rows = dataRows.map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      ).filter(row => row.length > 0);
      
      // Generate HTML table
      let tableHtml = '<table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600 my-4">';
      
      // Header
      tableHtml += '<thead class="bg-gray-50 dark:bg-gray-700">';
      tableHtml += '<tr>';
      headers.forEach(header => {
        tableHtml += `<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium">${header}</th>`;
      });
      tableHtml += '</tr>';
      tableHtml += '</thead>';
      
      // Body
      tableHtml += '<tbody>';
      rows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          tableHtml += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody>';
      tableHtml += '</table>';
      
      return tableHtml;
    });

    // Replace code blocks
    formattedContent = formattedContent.replace(codeBlockRegex, (match, lang, code) => {
      return `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto my-2"><code class="text-sm">${code.trim()}</code></pre>`;
    });

    // Replace inline code
    formattedContent = formattedContent.replace(inlineCodeRegex, (match, code) => {
      return `<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">${code}</code>`;
    });

    // Handle line breaks
    formattedContent = formattedContent.replace(/\n/g, '<br>');

    return formattedContent;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-xs lg:max-w-md xl:max-w-lg bg-[hsl(var(--gemini-primary))] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <div className="text-xs text-emerald-100 mt-2 flex items-center justify-end">
            <span>{formatTime(new Date(message.createdAt))}</span>
            <CheckCheck className="ml-2 h-3 w-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-in">
      {message.role === "ai" ? (
        <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--gemini-primary))] to-[hsl(var(--gemini-secondary))] rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      ) : (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex-1 space-y-2">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            message.role === "ai"
              ? "bg-[hsl(var(--light-secondary))] dark:bg-[hsl(var(--dark-secondary))] rounded-tl-sm text-foreground"
              : "bg-[hsl(var(--gemini-primary))] text-white rounded-tr-sm ml-8"
          }`}
        >
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(message.content)
            }}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
            <span>{formatTime(new Date(message.createdAt))}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto p-1 h-auto hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={copyToClipboard}
              title="Copy message"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}