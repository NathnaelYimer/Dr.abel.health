import { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Bookmark, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface DashboardHeaderProps {
  user: Partial<User> & {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: Date | string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const stats = [
    { 
      label: 'Member Since', 
      value: user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A', 
      icon: Calendar 
    },
    { label: 'Saved Items', value: '24', icon: Bookmark },
    { label: 'Reading Time', value: '15h 42m', icon: Clock },
    { label: 'Unread Notifications', value: '3', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2">
            <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
            <AvatarFallback className="text-xl">
              {user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'User'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/settings">Edit Profile</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
