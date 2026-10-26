import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <main className="flex-1 mx-auto w-full px-4 sm:px-6 max-w-4xl py-10">
      {children}
    </main>
  );
}
