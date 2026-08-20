#!/bin/bash
# Fix design system tokens across all dashboard components
cd /home/z/my-project/src/components/dashboard

FILES=(
  DependencyCard.tsx
  DependencyGrid.tsx
  IncidentDetail.tsx
  IncidentList.tsx
  IncidentTimeline.tsx
  SeverityBadge.tsx
  StatusBadge.tsx
  ApiKeyManager.tsx
  MemberTable.tsx
  NotificationSettings.tsx
  DashboardHeader.tsx
  DashboardSidebar.tsx
  OrgSwitcher.tsx
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    sed -i 's/border-gray-200/border-[#E4E4E7]/g' "$f"
    sed -i 's/border-gray-100/border-[#F0F0F0]/g' "$f"
    sed -i 's/border-gray-300/border-[#D4D4D8]/g' "$f"
    sed -i 's/bg-gray-50/bg-[#F8F9FA]/g' "$f"
    sed -i 's/bg-gray-100/bg-[#F8F9FA]/g' "$f"
    sed -i 's/text-gray-900/text-[#09090B]/g' "$f"
    sed -i 's/text-gray-500/text-[#52525B]/g' "$f"
    sed -i 's/text-gray-600/text-[#52525B]/g' "$f"
    sed -i 's/text-gray-400/text-[#A1A1AA]/g' "$f"
    sed -i 's/bg-gray-400/bg-[#71717A]/g' "$f"
    sed -i 's/text-gray-700/text-[#3F3F46]/g' "$f"
    sed -i 's/hover:bg-gray-50/hover:bg-[#F8F9FA]/g' "$f"
    sed -i 's/hover:bg-gray-100/hover:bg-[#F8F9FA]/g' "$f"
    sed -i 's/hover:text-gray-900/hover:text-[#09090B]/g' "$f"
    sed -i 's/hover:text-gray-600/hover:text-[#09090B]/g' "$f"
    sed -i 's/hover:text-gray-500/hover:text-[#52525B]/g' "$f"
    sed -i 's/hover:border-gray-300/hover:border-[#D4D4D8]/g' "$f"
    echo "Fixed: $f"
  fi
done

echo "Done!"
