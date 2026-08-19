'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Lightweight token highlighter.
 *
 * A full syntax-highlighting bundle is unnecessary here — these blocks are
 * short JSON, shell and plain-text extracts, and shipping a grammar library
 * to a marketing page would cost more than it returns.
 */
function highlight(code: string, language: string): React.ReactNode[] {
  const lines = code.split('\n');

  return lines.map((line, i) => {
    let content: React.ReactNode = line;

    if (language === 'json') {
      const parts: React.ReactNode[] = [];
      const regex = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b-?\d+\.?\d*\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(line)) !== null) {
        if (m.index > last) parts.push(line.slice(last, m.index));
        const [text] = m;
        if (m[1]) parts.push(<span key={`${i}-${m.index}`} style={{ color: '#67E8F9' }}>{text}</span>);
        else if (m[2]) parts.push(<span key={`${i}-${m.index}`} style={{ color: '#86EFAC' }}>{text}</span>);
        else if (m[3]) parts.push(<span key={`${i}-${m.index}`} style={{ color: '#FCD34D' }}>{text}</span>);
        else parts.push(<span key={`${i}-${m.index}`} style={{ color: '#C4B5FD' }}>{text}</span>);
        last = m.index + text.length;
      }
      if (last < line.length) parts.push(line.slice(last));
      content = parts.length ? parts : line;
    } else if (language === 'bash') {
      if (line.trimStart().startsWith('#')) {
        content = <span style={{ color: '#71717A' }}>{line}</span>;
      } else {
        const parts: React.ReactNode[] = [];
        const regex = /("[^"]*")|(^\s*\w+)/g;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(line)) !== null) {
          if (m.index > last) parts.push(line.slice(last, m.index));
          const [text] = m;
          parts.push(
            <span key={`${i}-${m.index}`} style={{ color: m[1] ? '#86EFAC' : '#67E8F9' }}>
              {text}
            </span>,
          );
          last = m.index + text.length;
        }
        if (last < line.length) parts.push(line.slice(last));
        content = parts.length ? parts : line;
      }
    } else {
      // Plain text: dim comment-ish lines and rules, tint arrows and codes.
      if (/^[\s─│┌└├]*$/.test(line) || line.startsWith('──')) {
        content = <span style={{ color: '#3F3F46' }}>{line}</span>;
      } else {
        const parts: React.ReactNode[] = [];
        const regex = /(\b[45]\d{2}\b)|(\b200\b)|(→|←)|(\b\d{2}:\d{2}\b)|(\b\d+\.\d+%)/g;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(line)) !== null) {
          if (m.index > last) parts.push(line.slice(last, m.index));
          const [text] = m;
          const color = m[1]
            ? '#FCA5A5'
            : m[2]
              ? '#86EFAC'
              : m[3]
                ? '#67E8F9'
                : m[4]
                  ? '#A1A1AA'
                  : '#FCD34D';
          parts.push(
            <span key={`${i}-${m.index}`} style={{ color }}>
              {text}
            </span>,
          );
          last = m.index + text.length;
        }
        if (last < line.length) parts.push(line.slice(last));
        content = parts.length ? parts : line;
      }
    }

    return (
      <span key={i} className="block min-h-[1.5em]">
        {content}
      </span>
    );
  });
}

export function CodeBlock({
  code,
  language,
  caption,
}: {
  code: string;
  language: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — button simply does nothing */
    }
  };

  return (
    <figure className="my-8 overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#0F0F14]">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3F3F46]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3F3F46]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3F3F46]" />
          </span>
          <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-[#52525B]">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="-mr-1 inline-flex h-9 min-w-[72px] items-center justify-center gap-1.5 rounded-md px-3 text-[11px] font-medium text-[#71717A] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[#FAFAFA]"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[#16A34A]" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <pre className={cn('p-5 font-mono text-[12.5px] leading-[1.7] text-[#D4D4D8]')}>
          <code>{highlight(code, language)}</code>
        </pre>
      </div>

      {caption && (
        <figcaption className="border-t border-[rgba(255,255,255,0.07)] px-5 py-2.5 text-[11.5px] text-[#71717A]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
