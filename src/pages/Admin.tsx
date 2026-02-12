import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAdminData } from '@/hooks/useAdminData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, Eye, Search, Mail, MessageSquare, Activity, Thermometer } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const statusColor: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary',
  feedback_received: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const activityIcon: Record<string, string> = {
  visit: '👁️',
  feedback: '💬',
  email: '📧',
};

export default function Admin() {
  const { data, isLoading } = useAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide metrics and management</p>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard icon={Users} label="Users" value={data.kpis.totalUsers} />
            <KPICard icon={FileText} label="Pitches" value={data.kpis.totalPitches} sub={`${data.kpis.pitchesByStatus.draft} draft · ${data.kpis.pitchesByStatus.sent} sent · ${data.kpis.pitchesByStatus.feedback_received} feedback`} />
            <KPICard icon={Eye} label="Total Views" value={data.kpis.totalViews} sub={`${data.kpis.viewsLast7Days} last 7 days`} />
            <KPICard icon={Search} label="Leads Saved" value={data.kpis.totalLeads} />
            <KPICard icon={Mail} label="Emails Sent" value={data.kpis.totalEmailsSent} />
            <KPICard icon={MessageSquare} label="Feedback" value={data.kpis.totalFeedback} />
          </div>
        ) : null}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="pitches">Pitches</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="email">Email Health</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">All Users</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6"><Skeleton className="h-40 w-full" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Signed Up</TableHead>
                        <TableHead>Pitches</TableHead>
                        <TableHead>Leads</TableHead>
                        <TableHead>Emails</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.usersTable.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{u.pitchCount}</TableCell>
                          <TableCell>{u.leadCount}</TableCell>
                          <TableCell>{u.emailCount}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {u.last_sign_in_at ? formatDistanceToNow(new Date(u.last_sign_in_at), { addSuffix: true }) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pitches Tab */}
          <TabsContent value="pitches">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">All Pitches</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6"><Skeleton className="h-40 w-full" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.pitchesTable.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.client_name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{p.owner_email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColor[p.status] ?? ''}>
                              {p.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{p.views}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{format(new Date(p.created_at), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="space-y-3">
                    {data?.activity.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                        <span className="text-lg">{activityIcon[a.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            {a.type === 'visit' && `Page visit from ${a.country || 'unknown'} (${a.device || 'unknown'})`}
                            {a.type === 'feedback' && `Feedback from ${a.client_name || 'anonymous'}`}
                            {a.type === 'email' && `Email sent to ${a.recipient}: "${a.subject}"`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {data?.activity.length === 0 && (
                      <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Health Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email Health</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6"><Skeleton className="h-40 w-full" /></div>
                ) : data?.emailHealth.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No email connections</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Warmup</TableHead>
                        <TableHead>Temp</TableHead>
                        <TableHead>Deliverability</TableHead>
                        <TableHead>DNS</TableHead>
                        <TableHead>Sent / Limit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.emailHealth.map((e) => (
                        <TableRow key={e.email}>
                          <TableCell className="font-medium">{e.email}</TableCell>
                          <TableCell>
                            <Badge variant={e.warmy_state === 'enabled' ? 'default' : 'secondary'}>
                              {e.warmy_state || 'none'}
                            </Badge>
                          </TableCell>
                          <TableCell>{e.temperature ?? '—'}°</TableCell>
                          <TableCell>{e.deliverability ?? '—'}%</TableCell>
                          <TableCell>{e.dns_score ?? '—'}</TableCell>
                          <TableCell>{e.sent_today ?? 0} / {e.daily_limit ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function KPICard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
