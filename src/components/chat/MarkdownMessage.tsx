'use client'

import React from 'react'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export default function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  // Parse inline markdown (bold, italic, code) - handles text within a line
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    if (!text) return []
    
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let keyCounter = 0
    
    // Collect all matches with their positions
    const matches: Array<{ start: number; end: number; type: string; content: string }> = []
    
    // Code blocks first (```code```) - multi-line
    const codeBlockRegex = /```([\s\S]*?)```/g
    let match
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'code-block',
        content: match[1]
      })
    }
    
    // Inline code (`code`) - single backticks
    const inlineCodeRegex = /`([^`\n]+)`/g
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Don't add if it's inside a code block
      const isInsideCodeBlock = matches.some(m => 
        m.type === 'code-block' && match!.index >= m.start && match!.index < m.end
      )
      if (!isInsideCodeBlock) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'inline-code',
          content: match[1]
        })
      }
    }
    
    // Bold (**text** or __text__) - double asterisks or underscores
    const boldRegex1 = /\*\*([^*\n]+)\*\*/g
    while ((match = boldRegex1.exec(text)) !== null) {
      const isInsideCode = matches.some(m => 
        (m.type === 'code-block' || m.type === 'inline-code') && 
        match!.index >= m.start && match!.index < m.end
      )
      if (!isInsideCode) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'bold',
          content: match[1]
        })
      }
    }
    
    const boldRegex2 = /__([^_\n]+)__/g
    while ((match = boldRegex2.exec(text)) !== null) {
      const isInsideCode = matches.some(m => 
        (m.type === 'code-block' || m.type === 'inline-code') && 
        match!.index >= m.start && match!.index < m.end
      )
      if (!isInsideCode) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'bold',
          content: match[1]
        })
      }
    }
    
    // Italic (*text* or _text_) - single asterisk or underscore (but not part of bold)
    // Match single asterisks that aren't part of double asterisks
    const italicRegex1 = /\*([^*\n]+)\*/g
    while ((match = italicRegex1.exec(text)) !== null) {
      // Check if this is part of a bold match by checking surrounding characters
      const beforeChar = match.index > 0 ? text[match.index - 1] : ''
      const afterEnd = match.index + match[0].length
      const afterChar = afterEnd < text.length ? text[afterEnd] : ''
      const isPartOfBold = beforeChar === '*' || afterChar === '*'
      
      const isInsideCode = matches.some(m => 
        (m.type === 'code-block' || m.type === 'inline-code') && 
        match!.index >= m.start && match!.index < m.end
      )
      const isInsideBold = matches.some(m => 
        m.type === 'bold' && match!.index >= m.start && match!.index < m.end
      )
      if (!isInsideCode && !isInsideBold && !isPartOfBold) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'italic',
          content: match[1]
        })
      }
    }
    
    // Also handle single underscores (but not double underscores which are bold)
    const italicRegex2 = /_([^_\n]+)_/g
    while ((match = italicRegex2.exec(text)) !== null) {
      // Check if this is part of a bold match by checking surrounding characters
      const beforeChar = match.index > 0 ? text[match.index - 1] : ''
      const afterEnd = match.index + match[0].length
      const afterChar = afterEnd < text.length ? text[afterEnd] : ''
      const isPartOfBold = beforeChar === '_' || afterChar === '_'
      
      const isInsideCode = matches.some(m => 
        (m.type === 'code-block' || m.type === 'inline-code') && 
        match!.index >= m.start && match!.index < m.end
      )
      const isInsideBold = matches.some(m => 
        m.type === 'bold' && match!.index >= m.start && match!.index < m.end
      )
      if (!isInsideCode && !isInsideBold && !isPartOfBold) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'italic',
          content: match[1]
        })
      }
    }
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start)
    
    // Remove overlapping matches (keep the first one)
    const nonOverlappingMatches: typeof matches = []
    matches.forEach((m) => {
      const overlaps = nonOverlappingMatches.some(existing => 
        (m.start < existing.end && m.end > existing.start)
      )
      if (!overlaps) {
        nonOverlappingMatches.push(m)
      }
    })
    
    // Build parts
    nonOverlappingMatches.forEach((match) => {
      // Add text before match
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start)
        if (beforeText) {
          parts.push(
            <span key={`text-${keyCounter++}`}>
              {beforeText}
            </span>
          )
        }
      }
      
      // Add formatted content
      switch (match.type) {
        case 'code-block':
          parts.push(
            <code key={`code-${keyCounter++}`} className="block bg-black/20 dark:bg-white/10 p-2 rounded my-2 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {match.content}
            </code>
          )
          break
        case 'inline-code':
          parts.push(
            <code key={`code-${keyCounter++}`} className="bg-black/20 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">
              {match.content}
            </code>
          )
          break
        case 'bold':
          parts.push(
            <strong key={`bold-${keyCounter++}`} className="font-bold">
              {match.content}
            </strong>
          )
          break
        case 'italic':
          parts.push(
            <em key={`italic-${keyCounter++}`} className="italic">
              {match.content}
            </em>
          )
          break
      }
      
      lastIndex = match.end
    })
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex)
      if (remainingText) {
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {remainingText}
          </span>
        )
      }
    }
    
    return parts.length > 0 ? parts : [<span key="plain">{text}</span>]
  }
  
  // Parse block-level markdown (headers, lists, paragraphs)
  const parseMarkdown = (text: string): React.ReactNode[] => {
    if (!text) return []
    
    const lines = text.split('\n')
    const processedLines: React.ReactNode[] = []
    let inList = false
    let listItems: React.ReactNode[] = []
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim()
      
      // Headers
      if (trimmedLine.startsWith('### ')) {
        // Close any open list
        if (inList) {
          processedLines.push(
            <ul key={`ul-${lineIndex}`} className="list-disc ml-6 mb-2 space-y-1">
              {listItems}
            </ul>
          )
          listItems = []
          inList = false
        }
        processedLines.push(
          <h3 key={`h3-${lineIndex}`} className="font-bold text-lg mt-4 mb-2">
            {parseInlineMarkdown(trimmedLine.replace(/^### /, ''))}
          </h3>
        )
      } else if (trimmedLine.startsWith('## ')) {
        if (inList) {
          processedLines.push(
            <ul key={`ul-${lineIndex}`} className="list-disc ml-6 mb-2 space-y-1">
              {listItems}
            </ul>
          )
          listItems = []
          inList = false
        }
        processedLines.push(
          <h2 key={`h2-${lineIndex}`} className="font-bold text-xl mt-5 mb-3">
            {parseInlineMarkdown(trimmedLine.replace(/^## /, ''))}
          </h2>
        )
      } else if (trimmedLine.startsWith('# ')) {
        if (inList) {
          processedLines.push(
            <ul key={`ul-${lineIndex}`} className="list-disc ml-6 mb-2 space-y-1">
              {listItems}
            </ul>
          )
          listItems = []
          inList = false
        }
        processedLines.push(
          <h1 key={`h1-${lineIndex}`} className="font-bold text-2xl mt-6 mb-4">
            {parseInlineMarkdown(trimmedLine.replace(/^# /, ''))}
          </h1>
        )
      } 
      // List items
      else if (trimmedLine.match(/^[-*] /)) {
        if (!inList) {
          inList = true
        }
        listItems.push(
          <li key={`li-${lineIndex}`}>
            {parseInlineMarkdown(trimmedLine.replace(/^[-*] /, ''))}
          </li>
        )
      }
      // Empty line
      else if (trimmedLine === '') {
        if (inList) {
          processedLines.push(
            <ul key={`ul-${lineIndex}`} className="list-disc ml-6 mb-2 space-y-1">
              {listItems}
            </ul>
          )
          listItems = []
          inList = false
        }
        processedLines.push(<br key={`br-${lineIndex}`} />)
      }
      // Regular paragraph
      else {
        if (inList) {
          processedLines.push(
            <ul key={`ul-${lineIndex}`} className="list-disc ml-6 mb-2 space-y-1">
              {listItems}
            </ul>
          )
          listItems = []
          inList = false
        }
        processedLines.push(
          <p key={`p-${lineIndex}`} className="mb-2">
            {parseInlineMarkdown(trimmedLine)}
          </p>
        )
      }
    })
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      processedLines.push(
        <ul key={`ul-final`} className="list-disc ml-6 mb-2 space-y-1">
          {listItems}
        </ul>
      )
    }
    
    return processedLines
  }
  
  // Check if content has markdown
  const hasMarkdown = /[*_#`-]/.test(content)
  
  if (!hasMarkdown) {
    return <span className={className}>{content}</span>
  }
  
  return (
    <div className={className}>
      {parseMarkdown(content)}
    </div>
  )
}

