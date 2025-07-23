import { type LucideProps, type LucideIcon } from 'lucide-react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import dynamic from 'next/dynamic'

// Define the type for icon names
type IconName = keyof typeof dynamicIconImports

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = dynamic(dynamicIconImports[name])
  return <LucideIcon {...props} />
}

// Define the type for the Icons object
type IconsType = {
  [key: string]: (props: LucideProps) => JSX.Element
}

// Commonly used icons
export const Icons: IconsType = {
  // Status
  check: (props: LucideProps) => <Icon name="check" as const {...props} />,
  x: (props: LucideProps) => <Icon name="x" as const {...props} />,
  alertTriangle: (props: LucideProps) => <Icon name="alert-triangle" as const {...props} />,
  
  // Actions
  edit: (props: LucideProps) => <Icon name="edit" as const {...props} />,
  trash: (props: LucideProps) => <Icon name="trash-2" as const {...props} />,
  moreVertical: (props: LucideProps) => <Icon name="more-vertical" as const {...props} />,
  send: (props: LucideProps) => <Icon name="send" as const {...props} />,
  filter: (props: LucideProps) => <Icon name="filter" as const {...props} />,
  search: (props: LucideProps) => <Icon name="search" as const {...props} />,
  externalLink: (props: LucideProps) => <Icon name="external-link" as const {...props} />,
  
  // Navigation
  chevronDown: (props: LucideProps) => <Icon name="chevron-down" as const {...props} />,
  chevronRight: (props: LucideProps) => <Icon name="chevron-right" as const {...props} />,
  
  // UI Elements
  user: (props: LucideProps) => <Icon name="user" as const {...props} />,
  mail: (props: LucideProps) => <Icon name="mail" as const {...props} />,
  lock: (props: LucideProps) => <Icon name="lock" as const {...props} />,
  eye: (props: LucideProps) => <Icon name="eye" as const {...props} />,
  eyeOff: (props: LucideProps) => <Icon name="eye-off" as const {...props} />,
  
  // Social
  google: (props: LucideProps) => <Icon name="google" {...props} />,
  github: (props: LucideProps) => <Icon name="github" {...props} />,
  
  // Loading
  spinner: (props: LucideProps) => (
    <Icon
      name="loader-2"
      {...props}
      className={`animate-spin ${props.className || ''}`}
    />
  ),
  
  // Comments
  comment: (props: LucideProps) => <Icon name="message-square" {...props} />,
  
  // Dashboard
  home: (props: LucideProps) => <Icon name="home" as const {...props} />,
  fileText: (props: LucideProps) => <Icon name="file-text" as const {...props} />,
  users: (props: LucideProps) => <Icon name="users" as const {...props} />,
  messageSquare: (props: LucideProps) => <Icon name="message-square" as const {...props} />,
  calendar: (props: LucideProps) => <Icon name="calendar" as const {...props} />,
  barChart: (props: LucideProps) => <Icon name="bar-chart-2" as const {...props} />,
  settings: (props: LucideProps) => <Icon name="settings" {...props} />,
  folder: (props: LucideProps) => <Icon name="folder" {...props} />,
  tag: (props: LucideProps) => <Icon name="tag" {...props} />,
  layers: (props: LucideProps) => <Icon name="layers" {...props} />,
  fileArchive: (props: LucideProps) => <Icon name="archive" {...props} />,
  bookOpen: (props: LucideProps) => <Icon name="book-open" {...props} />,
}
