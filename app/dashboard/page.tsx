import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SavedItems } from '@/components/dashboard/SavedItems';
import { ReadingHistory } from '@/components/dashboard/ReadingHistory';
import { Notifications } from '@/components/dashboard/Notifications';
import { AccountSettings } from '@/components/dashboard/AccountSettings';
import { User } from 'next-auth';

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your account and activity',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Create a properly typed user object for DashboardHeader
  const headerUser: Parameters<typeof DashboardHeader>[0]['user'] = {
    ...session.user,
    name: session.user.name || undefined,
    email: session.user.email || undefined,
    image: session.user.image || undefined,
    createdAt: new Date()
  };

  return (
    <div className="container max-w-6xl py-8">
      <DashboardHeader user={headerUser} />
      
      <Tabs defaultValue="saved" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="saved">Saved Items</TabsTrigger>
          <TabsTrigger value="history">Reading History</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="saved" className="mt-6">
          <SavedItems />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <ReadingHistory />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Notifications />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
