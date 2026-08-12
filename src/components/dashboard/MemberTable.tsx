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
import type { OrgMember } from "@/services/orgService";

const roleColors: Record<string, string> = {
  owner: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  member: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  viewer: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

interface MemberTableProps {
  members: OrgMember[];
}

export function MemberTable({ members }: MemberTableProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [localMembers, setLocalMembers] = useState(members);

  const handleInvite = () => {
    if (!inviteEmail) return;
    setLocalMembers([
      ...localMembers,
      {
        id: `mem_${Date.now()}`,
        email: inviteEmail,
        full_name: inviteEmail.split("@")[0],
        role: "member",
        joined_at: new Date().toISOString(),
        avatar_url: null,
      },
    ]);
    setInviteEmail("");
    setInviteOpen(false);
    toast.success("Invitation sent");
  };

  const handleRoleChange = (id: string, role: string) => {
    setLocalMembers(localMembers.map((m) => (m.id === id ? { ...m, role: role as OrgMember["role"] } : m)));
    toast.success(`Role updated to ${role}`);
  };

  const handleRemove = (id: string) => {
    setLocalMembers(localMembers.filter((m) => m.id !== id));
    toast.success("Member removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#94A3B8]">{localMembers.length} team members</p>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-xs h-9">
              <UserPlus className="h-3.5 w-3.5" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1D27] border-[#2A2D3A] text-[#F1F5F9]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-[#94A3B8] mb-1.5 block">Email Address</label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="bg-[#0F1117] border-[#2A2D3A] text-[#F1F5F9]"
                />
              </div>
              <Button onClick={handleInvite} className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-[#2A2D3A] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2D3A]">
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Member</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Role</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Joined</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]"></th>
            </tr>
          </thead>
          <tbody>
            {localMembers.map((member) => (
              <tr key={member.id} className="border-b border-[#2A2D3A] last:border-0 hover:bg-[#141B2D] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-xs font-medium">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F1F5F9]">{member.full_name}</p>
                      <p className="text-xs text-[#64748B]">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${roleColors[member.role]}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#94A3B8]">
                  {format(new Date(member.joined_at), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3 text-right">
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 rounded-lg hover:bg-[#2A2D3A] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9]">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1A1D27] border-[#2A2D3A]">
                        {(["admin", "member", "viewer"] as const).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleRoleChange(member.id, role)}
                            className="text-[#94A3B8] hover:text-[#F1F5F9] capitalize"
                          >
                            Set as {role}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => handleRemove(member.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
