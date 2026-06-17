import type { ReactNode } from "react";

type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function renderMarks(text: string, marks?: TipTapNode["marks"]) {
  if (!marks?.length) return text;
  return marks.reduce((acc, mark) => {
    if (mark.type === "bold") return <strong key={mark.type}>{acc}</strong>;
    if (mark.type === "italic") return <em key={mark.type}>{acc}</em>;
    if (mark.type === "code") return <code key={mark.type}>{acc}</code>;
    return acc;
  }, text as ReactNode);
}

function renderNode(node: TipTapNode, key: number | string): ReactNode {
  if (node.type === "text") {
    return <span key={key}>{renderMarks(node.text ?? "", node.marks)}</span>;
  }

  const children = (node.content ?? []).map((child, i) => renderNode(child, `${key}-${i}`));

  switch (node.type) {
    case "doc":
      return <div key={key}>{children}</div>;
    case "paragraph":
      return (
        <p key={key} className="mb-4 text-slate-700 leading-7">
          {children}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Tag = level === 3 ? "h3" : level === 4 ? "h4" : "h2";
      return (
        <Tag key={key} className="mb-3 mt-6 font-display font-semibold text-[#021d33]">
          {children}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="mb-4 list-disc space-y-1 pl-6 text-slate-700">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="mb-4 list-decimal space-y-1 pl-6 text-slate-700">
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return (
        <blockquote key={key} className="mb-4 border-l-4 border-[#005B96]/30 pl-4 italic text-slate-600">
          {children}
        </blockquote>
      );
    case "image":
      return (
        <figure key={key} className="my-6">
          <img
            src={String(node.attrs?.src ?? "")}
            alt={String(node.attrs?.alt ?? "")}
            className="rounded-xl border border-slate-200"
          />
          {node.attrs?.title ? (
            <figcaption className="mt-2 text-center text-xs text-slate-500">{String(node.attrs.title)}</figcaption>
          ) : null}
        </figure>
      );
    case "horizontalRule":
      return <hr key={key} className="my-6 border-slate-200" />;
    default:
      return <div key={key}>{children}</div>;
  }
}

export function TipTapRenderer({ doc }: { doc: Record<string, unknown> | TipTapNode }) {
  const root = doc as TipTapNode;
  if (!root?.type && !root?.content) {
    return null;
  }
  return <div className="prose prose-slate max-w-none">{renderNode(root, 0)}</div>;
}
