'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Copy,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Link2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  getPartnerProfile,
  getPartnerDashboard,
  getReferralLinks,
  createReferralLink,
  getCommissions,
  formatMinor,
} from '@/services/partnerService';
import type {
  PartnerProfile,
  PartnerDashboardData,
  ReferralLink,
  CommissionItem,
} from '@/types/partner';
import { toast } from 'sonner';

// ── Animation variants ──────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ── Skeleton Components ────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6">
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
        <div className="h-8 w-32 bg-gray-100 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#E4E4E7]">
      <div className="animate-pulse flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
        <div className="h-4 w-40 bg-gray-100 rounded" />
      </div>
      <div className="animate-pulse h-4 w-20 bg-gray-100 rounded" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="pt-[100px] pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="animate-pulse mb-10">
          <div className="h-8 w-48 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="animate-pulse h-6 w-32 bg-gray-100 rounded mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white border border-[#E4E4E7] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#A1A1AA]">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-[#F8F9FA] flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-[#52525B]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#09090B] tracking-tight font-['IBM_Plex_Mono',monospace]">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[#A1A1AA] mt-1">{sub}</p>
      )}
    </motion.div>
  );
}

// ── Status Badge ───────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    suspended: 'bg-gray-50 text-gray-600 border-gray-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        styles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {status === 'paid' || status === 'approved' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : status === 'pending' ? (
        <Clock className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Not Authenticated ───────────────────────────────────────────

function NotAuthenticated() {
  return (
    <div className="pt-[140px] pb-20">
      <div className="max-w-[480px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0891B2]/8 border border-[#0891B2]/15 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-[#0891B2]" />
          </div>
          <h1 className="text-2xl font-bold text-[#09090B] mb-3">
            Partner Dashboard
          </h1>
          <p className="text-[#52525B] mb-8 leading-relaxed">
            Sign in to access your partner dashboard, manage referral links,
            track commissions, and view your earnings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/register?returnTo=%2Fdashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-[10px] font-semibold text-sm bg-[#09090B] text-white text-center hover:bg-[#09090B]/90 transition-colors"
            >
              Create Account
            </a>
            <a
              href="/login?returnTo=%2Fdashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-[10px] font-semibold text-sm text-[#52525B] border border-[#E4E4E7] text-center hover:bg-[#F8F9FA] transition-colors"
            >
              Sign In
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Application Pending ────────────────────────────────────────

function ApplicationPending({ profile }: { profile: PartnerProfile }) {
  return (
    <div className="pt-[140px] pb-20">
      <div className="max-w-[480px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#09090B] mb-3">
            Application Under Review
          </h1>
          <p className="text-[#52525B] mb-4 leading-relaxed">
            Your partner application is currently being reviewed. We typically
            process applications within 1-2 business days.
          </p>
          <StatusBadge status={profile.status} />
          <p className="text-xs text-[#A1A1AA] mt-6">
            Applied as <span className="font-medium text-[#52525B]">{profile.partner_type}</span> on{' '}
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Not a Partner (Apply CTA) ──────────────────────────────────

function NotPartner() {
  return (
    <div className="pt-[140px] pb-20">
      <div className="max-w-[480px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0891B2]/8 border border-[#0891B2]/15 flex items-center justify-center mx-auto mb-6">
            <Link2 className="w-8 h-8 text-[#0891B2]" />
          </div>
          <h1 className="text-2xl font-bold text-[#09090B] mb-3">
            Join the Partner Program
          </h1>
          <p className="text-[#52525B] mb-8 leading-relaxed">
            You&#39;re signed in but haven&#39;t applied to the partner program yet.
            Apply now to start earning commissions on referrals.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] font-semibold text-sm bg-[#0891B2] text-white hover:bg-[#0891B2]/90 transition-colors"
          >
            Learn About the Program
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Partner Dashboard ─────────────────────────────────────

function PartnerDashboardContent() {
  const { isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [dashboard, setDashboard] = useState<PartnerDashboardData | null>(null);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, dashData, linksData, commissionsData] =
        await Promise.allSettled([
          getPartnerProfile(),
          getPartnerDashboard(),
          getReferralLinks(),
          getCommissions(),
        ]);

      if (profileData.status === 'fulfilled') setProfile(profileData.value);
      if (dashData.status === 'fulfilled') setDashboard(dashData.value);
      if (linksData.status === 'fulfilled') setReferralLinks(linksData.value);
      if (commissionsData.status === 'fulfilled') setCommissions(commissionsData.value);

      // If profile fetch failed with 404, user is not a partner
      if (profileData.status === 'rejected') {
        const err = profileData.reason;
        if (err?.status === 404) {
          setProfile(null);
        } else {
          setError('Unable to load partner data. Please try again.');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleCreateLink = async () => {
    if (!newLinkName.trim()) return;
    setCreatingLink(true);
    try {
      const link = await createReferralLink({ name: newLinkName.trim() });
      setReferralLinks((prev) => [link, ...prev]);
      setNewLinkName('');
      setShowCreateLink(false);
      toast.success('Referral link created');
    } catch {
      toast.error('Failed to create referral link');
    } finally {
      setCreatingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy')
    );
  };

  // ── Loading State ──
  if (authLoading || loading) return <DashboardSkeleton />;

  // ── Error State ──
  if (error) {
    return (
      <div className="pt-[140px] pb-20">
        <div className="max-w-[480px] mx-auto px-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-[#52525B] mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-semibold text-sm bg-[#09090B] text-white hover:bg-[#09090B]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Not a Partner ──
  if (profile === null) return <NotPartner />;

  // ── Application Pending/Rejected/Suspended ──
  if (profile.status !== 'approved') return <ApplicationPending profile={profile} />;

  // ── Approved Partner Dashboard ──
  const stats = dashboard
    ? [
        {
          label: 'Total Earned',
          value: formatMinor(dashboard.total_earned),
          icon: DollarSign,
          sub: 'Lifetime commissions',
        },
        {
          label: 'Pending Payout',
          value: formatMinor(dashboard.total_pending),
          icon: Clock,
          sub: 'Next payout cycle',
        },
        {
          label: 'Total Referrals',
          value: String(dashboard.referral_count),
          icon: Users,
          sub: `${dashboard.active_referral_links} active links`,
        },
        {
          label: 'Paid Out',
          value: formatMinor(dashboard.total_paid),
          icon: CheckCircle2,
          sub: 'Completed settlements',
        },
      ]
    : [];

  return (
    <div className="pt-[100px] pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#09090B]">
                  Partner Dashboard
                </h1>
                <StatusBadge status={profile.status} />
              </div>
              <p className="text-sm text-[#52525B]">
                {profile.partner_type} partner &middot; {profile.commission_rate}% commission rate
              </p>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#52525B] border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>

        {/* Referral Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#09090B]">
              Referral Links
            </h2>
            <button
              onClick={() => setShowCreateLink(!showCreateLink)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[#0891B2] bg-[#0891B2]/8 hover:bg-[#0891B2]/15 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Link
            </button>
          </div>

          {/* Create Link Form */}
          {showCreateLink && (
            <div className="bg-[#F8F9FA] border border-[#E4E4E7] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateLink()}
                  placeholder="Link name (e.g. Twitter campaign)"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E4E4E7] bg-white text-sm text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#0891B2]/30 focus:border-[#0891B2]"
                />
                <button
                  onClick={handleCreateLink}
                  disabled={creatingLink || !newLinkName.trim()}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-[#0891B2] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0891B2]/90 transition-colors"
                >
                  {creatingLink ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateLink(false);
                    setNewLinkName('');
                  }}
                  className="p-2.5 rounded-lg text-[#A1A1AA] hover:text-[#09090B] hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Links List */}
          {referralLinks.length === 0 ? (
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-8 text-center">
              <Link2 className="w-10 h-10 text-[#A1A1AA] mx-auto mb-3" />
              <p className="text-sm text-[#52525B]">
                No referral links yet. Create your first link to start sharing.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E4E4E7] rounded-xl divide-y divide-[#E4E4E7]">
              {referralLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#09090B] truncate">
                        {link.name}
                      </span>
                      {link.is_active ? (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] font-medium text-[#A1A1AA] bg-gray-100 px-1.5 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-[#A1A1AA] font-['IBM_Plex_Mono',monospace] truncate">
                      {link.url}
                    </p>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      {link.clicks} clicks &middot; {link.conversions} conversions
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#52525B] border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0891B2] hover:bg-[#0891B2]/8 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Commissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-[#09090B] mb-4">
            Recent Commissions
          </h2>
          {commissions.length === 0 ? (
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-8 text-center">
              <DollarSign className="w-10 h-10 text-[#A1A1AA] mx-auto mb-3" />
              <p className="text-sm text-[#52525B]">
                No commissions yet. Share your referral links to start earning.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E4E4E7] rounded-xl divide-y divide-[#E4E4E7]">
              {commissions.slice(0, 10).map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#09090B] truncate">
                      {c.description || c.type}
                    </p>
                    <p className="text-xs text-[#A1A1AA]">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-[#09090B] font-['IBM_Plex_Mono',monospace]">
                      {formatMinor(c.amount)}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ── Page Entry Point ────────────────────────────────────────────

export default function PartnerDashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <DashboardSkeleton />;
  if (!isAuthenticated) return <NotAuthenticated />;
  return <PartnerDashboardContent />;
}
