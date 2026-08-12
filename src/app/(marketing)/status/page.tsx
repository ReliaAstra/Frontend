import { Metadata } from 'next';
import { StatusContent } from './status-content';

export const metadata: Metadata = {
  title: 'System Status | Reliastra',
  description: 'Real-time status of Reliastra monitoring systems. Check uptime, incidents, and service health.',
};

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <StatusContent />
    </main>
  );
}
