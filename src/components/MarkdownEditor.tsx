'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface HistoryState {
  value: string
  cursorPosition: number
}

interface ToolbarButton {
  label: string
  action: () => void
  title: string
  disabled?: boolean
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [showHelp, setShowHelp] = useState(false)
  const [history, setHistory] = useState<HistoryState[]>([{ value: '', cursorPosition: 0 }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastValueRef = useRef(value)
  
  // Track undo/redo history
  useEffect(() => {
    if (value !== lastValueRef.current) {
      const newHistory = history.slice(0, historyIndex + 1)
      const cursorPosition = textareaRef.current?.selectionEnd || 0
      newHistory.push({ value, cursorPosition })
      
      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      lastValueRef.current = value
    }
  }, [value])
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const historyItem = history[newIndex]
      setHistoryIndex(newIndex)
      onChange(historyItem.value)
      lastValueRef.current = historyItem.value
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(historyItem.cursorPosition, historyItem.cursorPosition)
          textareaRef.current.focus()
        }
      }, 0)
    }
  }
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const historyItem = history[newIndex]
      setHistoryIndex(newIndex)
      onChange(historyItem.value)
      lastValueRef.current = historyItem.value
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(historyItem.cursorPosition, historyItem.cursorPosition)
          textareaRef.current.focus()
        }
      }, 0)
    }
  }
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'write' || !textareaRef.current) return
      
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
      
      // Other shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault()
            insertText('**', '**')
            break
          case 'i':
            e.preventDefault()
            insertText('*', '*')
            break
          case 'k':
            e.preventDefault()
            insertText('[', '](url)')
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, historyIndex, history])

  const insertText = (before: string, after: string = '', replaceSelection: boolean = false) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = replaceSelection ? '' : value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }
  
  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Find the start of the current line
    let lineStart = start
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--
    }
    
    // Insert prefix at the beginning of the line
    const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart)
    onChange(newText)
    
    // Adjust cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }
  
  const toggleLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    
    // Find the start of the current line
    let lineStart = start
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--
    }
    
    // Check if line already has the prefix
    if (value.substring(lineStart).startsWith(prefix)) {
      // Remove prefix
      const newText = value.substring(0, lineStart) + value.substring(lineStart + prefix.length)
      onChange(newText)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start - prefix.length, start - prefix.length)
      }, 0)
    } else {
      insertLinePrefix(prefix)
    }
  }

  const toolbarGroups: { name: string; buttons: ToolbarButton[] }[] = [
    {
      name: 'history',
      buttons: [
        { 
          label: '↶', 
          action: handleUndo, 
          title: 'Undo (Cmd/Ctrl+Z)',
          disabled: historyIndex <= 0
        },
        { 
          label: '↷', 
          action: handleRedo, 
          title: 'Redo (Cmd/Ctrl+Y)',
          disabled: historyIndex >= history.length - 1
        },
      ]
    },
    {
      name: 'headings',
      buttons: [
        { label: 'H1', action: () => insertLinePrefix('# '), title: 'Heading 1' },
        { label: 'H2', action: () => insertLinePrefix('## '), title: 'Heading 2' },
        { label: 'H3', action: () => insertLinePrefix('### '), title: 'Heading 3' },
      ]
    },
    {
      name: 'formatting',
      buttons: [
        { label: 'B', action: () => insertText('**', '**'), title: 'Bold (Cmd/Ctrl+B)' },
        { label: 'I', action: () => insertText('*', '*'), title: 'Italic (Cmd/Ctrl+I)' },
        { label: 'S̶', action: () => insertText('~~', '~~'), title: 'Strikethrough' },
        { label: 'Code', action: () => insertText('`', '`'), title: 'Inline Code' },
      ]
    },
    {
      name: 'lists',
      buttons: [
        { label: '• List', action: () => toggleLinePrefix('- '), title: 'Bullet List' },
        { label: '1. List', action: () => toggleLinePrefix('1. '), title: 'Numbered List' },
        { label: '☐ Task', action: () => toggleLinePrefix('- [ ] '), title: 'Task List' },
      ]
    },
    {
      name: 'blocks',
      buttons: [
        { label: '" Quote', action: () => toggleLinePrefix('> '), title: 'Quote' },
        { label: '--- Rule', action: () => insertText('\n---\n', '', true), title: 'Horizontal Rule' },
        { label: '</> Code', action: () => insertText('\n```\n', '\n```\n'), title: 'Code Block' },
      ]
    },
    {
      name: 'insert',
      buttons: [
        { label: '🔗 Link', action: () => insertText('[', '](url)'), title: 'Link (Cmd/Ctrl+K)' },
        { label: '📷 Image', action: () => insertText('![', '](url)'), title: 'Image' },
        { label: '📊 Table', action: () => insertText('\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n', ''), title: 'Table' },
      ]
    },
    {
      name: 'math',
      buttons: [
        { label: 'ƒ Math', action: () => insertText('$', '$'), title: 'Inline LaTeX' },
        { label: '∑ Block', action: () => insertText('\n$$\n', '\n$$\n'), title: 'LaTeX Block' },
      ]
    },
  ]

  const formattingHelp = [
    { syntax: '**bold**', result: 'bold', description: 'Bold text' },
    { syntax: '*italic*', result: 'italic', description: 'Italic text' },
    { syntax: '~~strike~~', result: 'strikethrough', description: 'Strikethrough' },
    { syntax: '# Heading 1', result: 'Large heading', description: 'Main heading' },
    { syntax: '## Heading 2', result: 'Medium heading', description: 'Subheading' },
    { syntax: '- Item', result: '• Item', description: 'Bullet list' },
    { syntax: '1. Item', result: '1. Item', description: 'Numbered list' },
    { syntax: '- [ ] Task', result: '☐ Task', description: 'Task list' },
    { syntax: '> Quote', result: 'Quoted text', description: 'Blockquote' },
    { syntax: '[Link](url)', result: 'Link', description: 'Hyperlink' },
    { syntax: '![Alt](url)', result: '📷 Image', description: 'Image' },
    { syntax: '`code`', result: 'code', description: 'Inline code' },
    { syntax: '```\ncode\n```', result: 'Code block', description: 'Multi-line code' },
    { syntax: '$x^2$', result: 'x²', description: 'Inline math' },
    { syntax: '$$\nE=mc^2\n$$', result: 'E=mc²', description: 'Display math' },
  ]

  return (
    <div className="border border-purple-700/40 dark:border-purple-700/40 rounded-none overflow-hidden shadow-sm">
      {/* Tabs */}
      <div className="flex justify-between border-b border-purple-700/40 dark:border-purple-700/40 bg-white dark:bg-black">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'write'
                ? 'text-purple-800 dark:text-purple-600 border-b-2 border-purple-800 dark:border-purple-600'
                : 'text-white/60 dark:text-white/70 hover:text-white dark:hover:text-white'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-purple-800 dark:text-purple-600 border-b-2 border-purple-800 dark:border-purple-600'
                : 'text-white/60 dark:text-white/70 hover:text-white dark:hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="px-3 py-2 text-sm text-white/60 dark:text-white/70 hover:text-white dark:hover:text-white transition-colors"
          title="Formatting help"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {activeTab === 'write' ? (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-2 border-b border-purple-700/40 dark:border-purple-700/40 bg-white dark:bg-black">
            {toolbarGroups.map((group, groupIndex) => (
              <div key={group.name} className="flex items-center">
                <div className="flex gap-1">
                  {group.buttons.map((button) => (
                    <button
                      key={button.label}
                      type="button"
                      onClick={button.action}
                      title={button.title}
                      disabled={button.disabled || false}
                      className={`px-2 py-1 text-sm font-medium transition-colors ${
                        button.disabled
                          ? 'text-white/70 dark:text-white/60 cursor-not-allowed'
                          : 'text-white/80 dark:text-white/80 hover:bg-purple-900/20 dark:hover:bg-purple-900/40'
                      }`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
                {groupIndex < toolbarGroups.length - 1 && (
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Editor */}
          <textarea
            ref={textareaRef}
            id="content-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[400px] p-4 bg-white dark:bg-black text-white dark:text-gray-100 resize-none focus:outline-none font-mono text-sm"
            spellCheck={true}
          />
          
          {/* Help Panel */}
          {showHelp && (
            <div className="border-t border-purple-700/40 dark:border-purple-700/40 bg-purple-50 dark:bg-black/50 p-4">
              <h4 className="text-sm font-semibold text-white/80 dark:text-white/80 mb-2">Formatting Guide</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {formattingHelp.map((item) => (
                  <div key={item.syntax} className="flex items-center space-x-2">
                    <code className="bg-purple-900/10 dark:bg-purple-900/40 px-1.5 py-0.5 text-white/80 dark:text-white/80 font-mono">
                      {item.syntax}
                    </code>
                    <span className="text-white/60 dark:text-white/70">→</span>
                    <span className="text-white/80 dark:text-white/80">{item.result}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-white/60 dark:text-white/70">
                <strong>Shortcuts:</strong> Cmd/Ctrl+B (bold), Cmd/Ctrl+I (italic), Cmd/Ctrl+K (link), Cmd/Ctrl+Z (undo), Cmd/Ctrl+Y (redo)
              </div>
            </div>
          )}
        </>
      ) : (
        /* Preview */
        <div className="min-h-[400px] p-4 bg-white dark:bg-black">
          <div className="markdown-content prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {value || '*Nothing to preview*'}
            </ReactMarkdown>
          </div>
        </div>
      )}
      
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white dark:bg-black border-t border-purple-700/40 dark:border-purple-700/40 text-xs text-white/60 dark:text-white/70">
        <div className="flex gap-4">
          <span>{value.length} characters</span>
          <span>{value.split(/\s+/).filter(word => word.length > 0).length} words</span>
          <span>{value.split('\n').length} lines</span>
        </div>
        <div className="flex gap-2">
          {activeTab === 'write' && (
            <span className="text-white/60 dark:text-white/60">
              {historyIndex > 0 && `${historyIndex} actions to undo`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}