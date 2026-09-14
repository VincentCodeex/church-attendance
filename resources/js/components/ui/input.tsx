import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      style={{
        color: '#000000',
        WebkitTextFillColor: '#000000',
        backgroundColor: '#ffffff',
        opacity: 1,
        ...style,
      }}
      className={cn(
        "border border-slate-300 !bg-white !text-black placeholder:!text-slate-500 font-medium selection:bg-sky-500 selection:text-white flex h-10 w-full min-w-0 rounded-xl px-3.5 py-2 text-sm shadow-xs transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[#340299] focus-visible:ring-2 focus-visible:ring-[#340299]/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
