import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,opacity,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg hover:bg-fg active:scale-[0.96]",
        secondary:
          "border border-border-strong bg-raised text-fg hover:bg-surface active:scale-[0.96]",
        ghost:
          "text-muted hover:text-fg hover:bg-raised active:scale-[0.96]",
        option:
          "w-full justify-start border border-border bg-surface text-left text-fg hover:border-border-strong hover:bg-raised data-[selected=true]:border-accent data-[selected=true]:bg-raised",
      },
      size: {
        sm: "h-10 rounded-sm px-3 text-sm",
        md: "h-12 rounded-md px-5 text-sm",
        lg: "h-14 rounded-md px-6 text-base",
        option: "min-h-14 rounded-md px-4 py-3 text-[0.95rem] leading-snug",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
