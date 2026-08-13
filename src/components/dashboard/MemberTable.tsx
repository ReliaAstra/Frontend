"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { orgService, type OrgMemberResponse } from "@/services/orgService";
import { useAuth } from "@/lib/auth-context";

const roleColors: Record<string, string> = {
  owner: "bg-violet-50 text-violet-600 border-violet-200",
  admin: "bg-blue-50 text-blue-600 border-blue-200",
  member: "bg-emerald-50 text-emerald-600 border-emerald-200",
  viewer: "bg-[#F8F9FA] text-[#52525B] border-[#D4D4D8]",
};

interface MemberTableProps {
  members: OrgMemberResponse[];
}

export function MemberTable({ members: initialMembers }: MemberTableProps) {
  const { currentOrg } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [localMembers, setLocalMembers] = useState(initialMembers);
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail || !currentOrg) return;
    setInviting(true);
    try {
      const newMember = await orgService.inviteMember(currentOrg.id, inviteEmail, "member");
      setLocalMembers([...localMembers, newMember]);
      setInviteEmail("");
      setInviteOpen(false);
      toast.success("Invitation sent");
    } catch {
      toast.error("Failed to send invitation. The user may not exist or is already a member.");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    if (!currentOrg) return;
    try {
      const updated = await orgService.updateMemberRole(currentOrg.id, memberId, role);
      setLocalMembers(localMembers.map((m) => (m.id === memberId ? updated : m)));
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!currentOrg) return;
    try {
      await orgService.removeMember(currentOrg.id, memberId);
      setLocalMembers(localMembers.filter((m) => m.id !== memberId));
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#52525B]">{localMembers.length} team members</p>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#0891B2] hover:bg-[#0891B2]/90 text-white text-xs h-9">
              <UserPlus className="h-3.5 w-3.5" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#E4E4E7] text-[#09090B]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-[#52525B] mb-1.5 block">Email Address</label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="bg-[#F8F9FA] border-[#E4E4E7] text-[#09090B]"
                />
                <p className="text-[10px] text-[#A1A1AA] mt-1">The user must already have a Reliastra account.</p>
              </div>
              <Button onClick={handleInvite} disabled={inviting} className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white">
                {inviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E4E4E7]">
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Member</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Role</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Joined</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]"></th>
            </tr>
          </thead>
          <tbody>
            {localMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#A1A1AA]">
                  No team members yet.
                </td>
              </tr>
            ) : (
              localMembers.map((member) => (
                <tr key={member.id} className="border-b border-[#E4E4E7] last:border-0 hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#0891B2] flex items-center justify-center text-white text-xs font-medium">
                        {member.user_id.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#09090B]">{member.user_id.slice(0, 12)}</p>
                        <p className="text-xs text-[#A1A1AA]">ID: {member.user_id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${roleColors[member.role] || roleColors.member}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#52525B]">
                    {format(new Date(member.joined_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 rounded-lg hover:bg-[#F8F9FA] flex items-center justify-center text-[#A1A1AA] hover:text-[#09090B]">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-[#E4E4E7]">
                          {(["admin", "member", "viewer"] as const).map((role) => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleRoleChange(member.id, role)}
                              className="text-[#52525B] hover:text-[#09090B] capitalize"
                            >
                              Set as {role}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleRemove(member.id)}
                            className="text-red-600 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
