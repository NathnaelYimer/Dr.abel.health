import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)} {...props}>
      <div className="flex-1">{children}</div>
    </div>
  )
}
