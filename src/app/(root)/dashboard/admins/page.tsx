"use client"

import { useState, useMemo } from 'react'
import {
    UserPlus, Trash2, Shield, Search, MoreVertical,
    UserCheck, UserMinus, Loader2, KeyRound, RefreshCw, Eye, EyeOff,
    ShieldCheck, Mail, Fingerprint, UserCog, Users, Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
    useGetAdminsQuery,
    useDeleteAdminMutation,
    useAddAdminMutation,
    useEditAdminMutation,
} from '@/store/features/admins'

export default function AdminManagement() {
    const { data: adminData, isLoading } = useGetAdminsQuery({})
    const [createAdmin, { isLoading: isCreating }] = useAddAdminMutation()
    const [updateAdmin, { isLoading: isUpdating }] = useEditAdminMutation()
    const [deleteAdmin] = useDeleteAdminMutation()

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const [formData, setFormData] = useState({
        name: "", email: "", password: "", admin_id: "", oldPassword: "", newPassword: "", status: "Active"
    })

    const admins = adminData?.admins || []

    const stats = useMemo(() => ({
        total: admins.length,
        active: admins.filter(a => a.status === "Active").length,
        inactive: admins.filter(a => a.status !== "Active").length,
    }), [admins])

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
        let retVal = ""
        for (let i = 0; i < 12; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length))
        }
        setFormData(prev => ({ ...prev, password: retVal, newPassword: retVal }))
        setShowPass(true)
        toast.info("Secure password generated")
    }

    const handleCreate = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            await createAdmin({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: "admin"
            }).unwrap()
            toast.success("New administrator onboarded")
            setIsCreateOpen(false)
            resetForm()
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to create admin")
        }
    }

    const handleUpdate = async () => {
        if (formData.newPassword && !formData.oldPassword) {
            toast.error("Current password is required to change to a new password");
            return;
        }

        try {
            await updateAdmin({
                email: formData.email,
                name: formData.name,
                status: formData.status,
                ...(formData.newPassword && {
                    old_password: formData.oldPassword,
                    new_password: formData.newPassword
                })
            }).unwrap()
            toast.success("Profile updated")
            setIsUpdateOpen(false)
            resetForm()
        } catch (err: any) {
            toast.error(err?.data?.message || "Update failed")
        }
    }

    const handleDelete = async (email: string) => {
        if (!confirm("Permanently delete admin?")) return;
        toast.promise(deleteAdmin({ email }).unwrap(), {
            loading: 'Revoking access...',
            success: 'Administrator removed',
            error: (err) => err?.data?.message || 'Failed to delete'
        });
    }

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", admin_id: "", oldPassword: "", newPassword: "", status: "Active" })
        setShowPass(false)
    }

    const openUpdateModal = (admin: any) => {
        setFormData(prev => ({
            ...prev,
            email: admin.email,
            name: admin.name,
            status: admin.status || "Active",
            oldPassword: "",
            newPassword: ""
        }))
        setIsUpdateOpen(true)
    }

    const filteredAdmins = useMemo(() => {
        return admins.filter(a => {
            const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
    }, [admins, searchQuery, statusFilter])

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1e293b] ">
            <div className="mx-auto space-y-8 ">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white shadow-sm rounded-2xl border border-slate-200">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Staff Management</h1>
                            <p className="text-slate-500 text-sm font-medium">Configure administrator roles and account security.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => { resetForm(); setIsCreateOpen(true); }}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white rounded-2xl h-14 px-8 shadow-lg shadow-slate-200 transition-all active:scale-95"
                    >
                        <UserPlus className="w-5 h-5 mr-2" /> New Admin
                    </Button>
                </header>

                {/* STATS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickStat label="Total Admins" value={stats.total} icon={<Users className="text-blue-500" />} color="blue" />
                    <QuickStat label="Active" value={stats.active} icon={<ShieldCheck className="text-emerald-500" />} color="emerald" />
                    <QuickStat label="Inactive" value={stats.inactive} icon={<UserMinus className="text-rose-500" />} color="rose" />
                </div>

                {/* DIRECTORY TABLE */}
                <Card className="border border-slate-200 bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            {["All", "Active", "Inactive"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab)}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                                        statusFilter === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search administrators..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 rounded-2xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    <TableHead className="px-8 h-14 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Admin</TableHead>

                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                                    <TableHead className="text-right px-8 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Control</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-24"><Loader2 className="animate-spin mx-auto text-indigo-500 w-8 h-8" /></TableCell></TableRow>
                                ) : filteredAdmins.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-20 text-slate-400 italic">No matches found.</TableCell></TableRow>
                                ) : filteredAdmins.map((admin) => (
                                    <TableRow key={admin.admin_id} className="group border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                    {admin.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{admin.name}</span>
                                                    <span className="text-slate-400 text-xs">{admin.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                admin.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"
                                            )}>
                                                {admin.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600"><MoreVertical size={20} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[180px]">
                                                    <DropdownMenuItem onClick={() => openUpdateModal(admin)} className="gap-3 py-3 rounded-xl cursor-pointer">
                                                        <UserCog size={16} className="text-indigo-500" /> Edit Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(admin.email)} className="gap-3 py-3 rounded-xl text-rose-600 focus:bg-rose-50 cursor-pointer">
                                                        <Trash2 size={16} /> Delete Access
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* CREATE MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-white rounded-[2.5rem] p-10 border-none shadow-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 leading-tight">Create Admin</DialogTitle>
                        <DialogDescription>Setup a new administrative profile with secure access.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Identity</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="h-14 rounded-2xl bg-slate-50 border-none" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Email</Label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@jjonj.org" className="h-14 rounded-2xl bg-slate-50 border-none" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Access Key</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showPass ? "text" : "password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="h-14 rounded-2xl bg-slate-50 border-none pr-12 font-mono"
                                    />
                                    <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <Button variant="outline" onClick={generatePassword} className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-indigo-50 transition-all">
                                    <RefreshCw size={22} className="text-indigo-600" />
                                </Button>
                            </div>
                        </div>
                        <Button onClick={handleCreate} disabled={isCreating} className="w-full h-16 bg-[#0f172a] hover:bg-black text-white rounded-2xl font-black text-lg mt-4 shadow-xl transition-all">
                            {isCreating ? <Loader2 className="animate-spin" /> : "Verify & Authorize"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent className="bg-white rounded-[2.5rem] p-10 border-none shadow-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</DialogTitle>
                        <DialogDescription>Modify info for <b>{formData.name}</b></DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-none" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</Label>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl border-slate-100">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                                <KeyRound size={14} /> Password Change
                            </div>
                            <div className="space-y-2">
                                <Label className={cn("text-[10px] font-bold uppercase tracking-widest", formData.newPassword ? "text-indigo-600" : "text-slate-400")}>
                                    New Password {formData.newPassword && "(Required)"}
                                </Label>
                                <div className="grid grid-cols-5 gap-2">
                                    <div className='col-span-3'>

                                        <Input
                                            type={showPass ? "text" : "password"}
                                            value={formData.newPassword}
                                            placeholder="Leave empty to keep current"
                                            onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="h-12 w-full rounded-xl bg-white border-none flex-1 font-mono text-xs"
                                        />
                                    </div>
                                    <div className='col-span-1 flex items-center justify-center'>

                                        <Button onClick={() => setShowPass(!showPass)} className=" text-slate-400 hover:text-indigo-600 bg-transparent border-none flex items-center justify-center transition-colors">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </Button>
                                    </div>
                                    <Button variant="outline" onClick={generatePassword} className="h-12 w-12 rounded-xl bg-white border-none col-span-1">
                                        <RefreshCw size={18} className="text-indigo-600" />
                                    </Button>
                                </div>
                            </div>

                            {formData.newPassword.length > 0 && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Verify Current Password</Label>
                                    <Input
                                        type="password"
                                        value={formData.oldPassword}
                                        onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                                        placeholder="Enter current key to confirm"
                                        className="h-12 rounded-xl bg-white border-2 border-rose-100"
                                    />
                                </div>
                            )}
                        </div>

                        <Button onClick={handleUpdate} disabled={isUpdating} className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg mt-4 shadow-lg shadow-indigo-100">
                            {isUpdating ? <Loader2 className="animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function QuickStat({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 border-blue-100",
        emerald: "bg-emerald-50 border-emerald-100",
        rose: "bg-rose-50 border-rose-100"
    }
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
            </div>
            <div className={cn("p-4 rounded-2xl border", colorMap[color])}>{icon}</div>
        </div>
    )
}