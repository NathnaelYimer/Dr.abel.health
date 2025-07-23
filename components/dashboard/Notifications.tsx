'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Mail, MessageSquare, ThumbsUp, UserPlus, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

type NotificationType = 'comment' | 'like' | 'follow' | 'mention' | 'alert' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

const notificationIcons = {
  comment: MessageSquare,
  like: ThumbsUp,
  follow: UserPlus,
  mention: Mail,
  alert: AlertTriangle,
  system: Bell,
};

const notificationColors = {
  comment: 'bg-blue-100 text-blue-700',
  like: 'bg-pink-100 text-pink-700',
  follow: 'bg-green-100 text-green-700',
  mention: 'bg-purple-100 text-purple-700',
  alert: 'bg-amber-100 text-amber-700',
  system: 'bg-gray-100 text-gray-700',
};

export function Notifications() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unread');
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data - in a real app, this would be fetched from your API
  useEffect(() => {
    if (status === 'authenticated') {
      // Simulate API call
      const fetchNotifications = async () => {
        setIsLoading(true);
        try {
          // In a real app, you would fetch this from your API
          // const response = await fetch('/api/notifications');
          // const data = await response.json();
          
          // Mock data
          const mockNotifications: Notification[] = [
            {
              id: '1',
              type: 'comment',
              title: 'New comment on your post',
              message: 'John Doe commented on your recent blog post about mental health.',
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
              actionUrl: '/blog/mental-health-2023',
              metadata: { commentId: '123', postId: '456' },
            },
            {
              id: '2',
              type: 'like',
              title: 'Your post was liked',
              message: 'Sarah Johnson and 5 others liked your project update.',
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
              actionUrl: '/projects/nutrition-program',
            },
            {
              id: '3',
              type: 'follow',
              title: 'New follower',
              message: 'Dr. Michael Chen started following you.',
              read: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
              actionUrl: '/profile/michael-chen',
            },
            {
              id: '4',
              type: 'mention',
              title: 'You were mentioned',
              message: 'Dr. Emily Wilson mentioned you in a comment on the annual report.',
              read: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              actionUrl: '/publications/annual-report-2023',
            },
            {
              id: '5',
              type: 'alert',
              title: 'Upcoming event reminder',
              message: 'Your webinar "Nutrition for Busy Professionals" starts in 1 hour.',
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              actionUrl: '/events/nutrition-webinar',
            },
          ];

          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [status]);

  const markAsRead = async (id: string) => {
    try {
      // In a real app, you would call your API to mark as read
      // await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real app, you would call your API to mark all as read
      // await fetch('/api/notifications/read-all', { method: 'POST' });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'read') return notification.read;
    return true; // 'all' tab
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            <div className="flex items-center gap-2">
              <span>Unread</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 w-5 items-center justify-center p-0">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-2">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium">
                  {activeTab === 'unread' 
                    ? 'No unread notifications'
                    : 'No notifications yet'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'unread'
                    ? 'You\'re all caught up!'
                    : 'Check back later for updates.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || 'bg-gray-100 text-gray-700';
              
              return (
                <Card 
                  key={notification.id}
                  className={`relative overflow-hidden transition-shadow hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-primary' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {notification.title}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              Mark as read
                            </Button>
                          )}
                          {notification.actionUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              asChild
                            >
                              <a href={notification.actionUrl}>
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </Tabs>
    </div>
  );
}
