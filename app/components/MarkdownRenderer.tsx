import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type MarkdownRendererProps = {
  markdown: string;
  className?: string;
};

export default function MarkdownRenderer({ markdown, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-7 text-2xl font-semibold tracking-tight text-slate-900">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mt-6 text-xl font-semibold text-slate-900">{children}</h3>,
          p: ({ children }) => <p className="mt-4 leading-7 text-slate-700">{children}</p>,
          ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">{children}</ul>,
          ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mt-5 border-l-4 border-slate-300 pl-4 italic text-slate-600">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const code = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              );
            }

            return (
              <code
                className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}