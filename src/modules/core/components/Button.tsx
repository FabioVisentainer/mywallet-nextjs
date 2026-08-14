"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "dangerSolid" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "h-[30px] px-2.5 text-xs rounded-lg gap-1",
  sm: "h-9 px-3.5 text-[13px] rounded-[9px] gap-1.5",
  md: "h-11 px-4.5 text-sm rounded-[10px] gap-2",
  lg: "h-[46px] px-5.5 text-sm rounded-[10px] gap-2",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border-none bg-[var(--color-brand)] text-white font-bold hover:bg-[var(--color-brand-hover)]",
  secondary: "border border-[var(--color-border-2)] bg-white font-semibold hover:bg-[var(--color-surface)]",
  danger: "border border-[var(--color-danger-border)] bg-white text-[var(--color-danger-fg)] font-semibold hover:bg-[var(--color-danger-bg)]",
  dangerSolid: "border-none bg-[var(--color-danger)] text-white font-bold hover:bg-[var(--color-danger-fg)]",
  ghost: "border-none bg-transparent text-[var(--color-text-muted)] font-semibold hover:text-[var(--color-text)]",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, fullWidth?: boolean, extra?: string) {
  return [
    "inline-flex items-center justify-center cursor-pointer transition-colors no-underline hover:no-underline disabled:opacity-60 disabled:cursor-not-allowed",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    fullWidth ? "w-full" : "",
    extra || "",
  ]
    .filter(Boolean)
    .join(" ");
}

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  onClick?: () => void;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Design-system button. Renders a `<button>` by default, or a `next/link`
 * styled the same way when `href` is passed (for CTAs that navigate).
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", fullWidth, className, children } = props;
  const cls = buttonClasses(variant, size, fullWidth, className);

  if (props.href !== undefined) {
    const { href, onClick } = props;
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stripping design props before spreading the rest onto <button>
  const { variant: _variant, size: _size, fullWidth: _fullWidth, className: _className, children: _children, href: _href, ...rest } = props;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
