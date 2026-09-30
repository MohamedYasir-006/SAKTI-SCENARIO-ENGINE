import * as React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function PageContainer({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <p className="mb-6 max-w-2xl text-sm text-slate-600">{description}</p>
          {children}
        </main>
      </div>
    </div>
  );
}
