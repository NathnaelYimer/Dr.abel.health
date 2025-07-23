import { cn } from "@/lib/utils"

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({
  heading,
  text,
  children,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-center justify-between", className)} {...props}>
      <div className="grid gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  )
}
