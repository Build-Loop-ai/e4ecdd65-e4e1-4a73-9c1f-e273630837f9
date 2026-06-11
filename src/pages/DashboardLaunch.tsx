import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LaunchChecklist } from '@/components/launch/LaunchChecklist';

export default function DashboardLaunch() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70 mb-1.5">Activation</p>
          <h1 className="text-2xl font-semibold text-foreground">Go Live</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Everything between your remix and your first pitch — checked for you.
          </p>
        </div>
        <div className="max-w-3xl">
          <LaunchChecklist />
        </div>
      </div>
    </DashboardLayout>
  );
}
