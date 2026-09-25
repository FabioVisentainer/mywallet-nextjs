import type {ReactNode} from "react";
import {Topbar} from "./Topbar";

interface Props {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: ReactNode;
}

/** Shared shell for every screen inside the (app) route group: topbar + padded content area. */
export function AppPage({ title, subtitle, backHref, children }: Props) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} backHref={backHref} />
      <div className="flex-1 px-7 pt-6.5 pb-15">{children}</div>
    </>
  );
}
