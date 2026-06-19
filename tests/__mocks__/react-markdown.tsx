import * as React from "react";

// Lightweight stub for the ESM-only react-markdown package so Jest can run
// component snapshot tests without transforming the whole remark/unified chain.
export default function ReactMarkdown({ children }: { children?: React.ReactNode }) {
  return <div className="markdown-mock">{children}</div>;
}
