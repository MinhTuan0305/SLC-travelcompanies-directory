"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, className, isOpen = false, onToggle, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-block text-left",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenu.displayName = "DropdownMenu";

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-luxury-navy shadow-luxury transition-all duration-200 hover:border-luxury-gold hover:shadow-luxury-hover focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/20",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute right-0 z-50 mt-2 w-56 origin-top-right border border-gray-100/50 bg-white shadow-luxury-lg backdrop-blur-xl animate-scale-in",
      className
    )}
    {...props}
  />
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "block px-4 py-3 text-sm text-luxury-navy transition-colors hover:bg-luxury-gold/5 hover:text-luxury-gold cursor-pointer",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
