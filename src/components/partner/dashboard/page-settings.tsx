'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePartnerStore } from '@/stores/partner-store';
import { maskEmail } from '@/lib/format';
import { ReferralLinkCard } from '@/components/partner/shared/referral-link-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// --- Account tab ---
function AccountTab() {
  const user = usePartnerStore((s) => s.user);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'P';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center size-12 rounded-full bg-muted text-sm font-mono font-medium">
          {initials}
        </div>
        <div>
          <p className="font-medium">{user?.name || 'Partner'}</p>
          <p className="text-sm text-muted-foreground font-mono">
            {user?.email || ''}
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Name
          </Label>
          <Input
            value={user?.name || ''}
            disabled
            className="font-mono text-sm bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Email
          </Label>
          <Input
            value={user?.email || ''}
            disabled
            className="font-mono text-sm bg-muted/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Partner status
        </Label>
        <div>
          <Badge variant="outline" className="text-xs font-mono">
            {user?.partner?.status?.toUpperCase() || 'ACTIVE'}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Account details are managed through your RELIASTRA account. Contact support to make changes.
      </p>
    </div>
  );
}

// --- Payout information tab ---
function PayoutInfoTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure your payout details. These are used when you request a withdrawal.
      </p>

      <Separator />

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Name on account
          </Label>
          <Input placeholder="Full legal name" className="font-mono text-sm" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Bank name
          </Label>
          <Input placeholder="Bank name" className="font-mono text-sm" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Account number
          </Label>
          <Input placeholder="Account number" className="font-mono text-sm" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Routing number
          </Label>
          <Input placeholder="Routing number" className="font-mono text-sm" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            SWIFT / BIC (international)
          </Label>
          <Input placeholder="Optional" className="font-mono text-sm" />
        </div>
      </div>

      <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wide">
        Payout information is not yet functional
      </Badge>
    </div>
  );
}

// --- Partner link tab ---
function PartnerLinkTab() {
  const dashboardData = usePartnerStore((s) => s.dashboardData);
  const user = usePartnerStore((s) => s.user);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Your unique referral link. Share it with potential customers to earn 30% recurring commission.
      </p>

      <Separator />

      <ReferralLinkCard
        link={dashboardData?.referralLink || ''}
        size="large"
      />

      {user?.partner?.referralCode && (
        <div className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Referral code
          </Label>
          <p className="font-mono text-sm text-foreground/80">
            {user.partner.referralCode.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
}

// --- Notifications tab ---
function NotificationsTab() {
  const [commissionNotif, setCommissionNotif] = useState(true);
  const [payoutNotif, setPayoutNotif] = useState(true);
  const [referralNotif, setReferralNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);

  const items = [
    {
      label: 'New commission',
      description: 'Get notified when a new commission is earned.',
      checked: commissionNotif,
      onCheckedChange: setCommissionNotif,
    },
    {
      label: 'Payout updates',
      description: 'Receive updates about your payout requests.',
      checked: payoutNotif,
      onCheckedChange: setPayoutNotif,
    },
    {
      label: 'New referrals',
      description: 'Know when someone signs up through your link.',
      checked: referralNotif,
      onCheckedChange: setReferralNotif,
    },
    {
      label: 'Marketing & tips',
      description: 'Occasional partner program updates and resources.',
      checked: marketingNotif,
      onCheckedChange: setMarketingNotif,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Manage your email notification preferences.
      </p>

      <Separator />

      <div className="space-y-0 divide-y divide-border/40">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="pr-4">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.description}
              </p>
            </div>
            <Switch
              checked={item.checked}
              onCheckedChange={item.onCheckedChange}
              aria-label={item.label}
            />
          </div>
        ))}
      </div>

      <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wide">
        Notification preferences are not yet saved
      </Badge>
    </div>
  );
}

// --- Main page ---
export function PageSettings() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Settings
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="account" className="text-xs font-mono uppercase tracking-wide">
              Account
            </TabsTrigger>
            <TabsTrigger value="payout" className="text-xs font-mono uppercase tracking-wide">
              Payout Info
            </TabsTrigger>
            <TabsTrigger value="link" className="text-xs font-mono uppercase tracking-wide">
              Partner Link
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs font-mono uppercase tracking-wide">
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <AccountTab />
          </TabsContent>

          <TabsContent value="payout" className="mt-6">
            <PayoutInfoTab />
          </TabsContent>

          <TabsContent value="link" className="mt-6">
            <PartnerLinkTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
