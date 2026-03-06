"use client"

import { useState, useMemo } from 'react'
import { format, parseISO, addDays } from 'date-fns'
import {
    Ticket,
    Plus,
    Trash2,
    Copy,
    Clock,
    Users,
    Search,
    ShieldCheck,
    CalendarDays,
    Inbox
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    useGetInviteCodesQuery,
    useCreateInviteCodeMutation,
    useDeleteInviteCodeMutation
} from '@/store/features/members'
import { toast } from 'sonner'

export default function InviteCodeDashboard() {
    const { data: code_data, isLoading } = useGetInviteCodesQuery()
    const [createCode, { isLoading: isCreating }] = useCreateInviteCodeMutation()
    const [deleteCodeApi] = useDeleteInviteCodeMutation()

    const [maxUses, setMaxUses] = useState(5)
    const [daysToExpiry, setDaysToExpiry] = useState(7)
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const codes = code_data?.codes || []

    // --- Search Logic ---
    const filteredCodes = useMemo(() => {
        return codes.filter((item) =>
            item.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [codes, searchQuery])

    const handleCreate = async () => {
        try {
            await createCode({
                maxUses: maxUses,
                days: daysToExpiry
            }).unwrap()

            toast.success(`Code generated (Valid for ${daysToExpiry} days)`)
            setIsOpen(false)
            setDaysToExpiry(7)
        } catch (err) {
            toast.error("Failed to generate code")
        }
    }

    const handleDelete = async (code: string) => {
        if (!confirm(`Permanently delete code ${code}?`)) return
        try {
            toast.promise(deleteCodeApi({ code }).unwrap(), {
                loading: "Deleting code...",
                success: "Code deleted successfully",
                error: "Deletion failed"
            })
        } catch (err) {
            toast.error("Deletion failed")
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1e293b] ">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">Invite Management</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Control access by generating time-limited invite codes.</p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl px-6 h-12 shadow-sm">
                                <Plus className="w-4 h-4 mr-2" /> New Invite Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white rounded-3xl border-none shadow-2xl p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-[#0f172a]">Configure Code</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Usage Limit (Max Uses)</label>
                                    <Input
                                        type="number"
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(parseInt(e.target.value))}
                                        className="border-slate-200 h-12 rounded-xl focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 text-flex items-center gap-2">
                                        Valid For (Days)
                                    </label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            placeholder="e.g. 7"
                                            value={daysToExpiry}
                                            onChange={(e) => setDaysToExpiry(parseInt(e.target.value))}
                                            className="border-slate-200 h-12 rounded-xl pl-10 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                                        The code will expire on {format(addDays(new Date(), daysToExpiry || 0), "PPP")}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating || isNaN(daysToExpiry)}
                                    className="w-full bg-[#0f172a] text-white font-bold h-14 rounded-xl mt-2 hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    {isCreating ? "Creating..." : "Generate Invite Code"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Active Codes" value={codes.length.toString()} icon={<Ticket className="text-indigo-500" />} />
                    <StatCard title="Total Uses" value={codes.reduce((acc, curr) => acc + curr.UsedCount, 0).toString()} icon={<Users className="text-blue-500" />} />
                </div>

                {/* Table Section */}
                <Card className="border border-slate-200 bg-white rounded-[1.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 p-6 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg font-bold text-slate-800">Invite History</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-full bg-slate-50 border-none text-sm focus:ring-1 focus:ring-indigo-400"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    <TableHead className="font-bold text-slate-600 px-6">Code</TableHead>
                                    <TableHead className="font-bold text-slate-600">Created</TableHead>
                                    <TableHead className="font-bold text-slate-600">Utilization</TableHead>
                                    <TableHead className="font-bold text-slate-600">Expiry</TableHead>
                                    <TableHead className="text-right px-6 font-bold text-slate-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                Loading codes...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCodes.length > 0 ? (
                                    filteredCodes.map((item) => (
                                        <TableRow key={item.code} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                            <TableCell className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <code className="bg-slate-100 text-slate-900 px-3 py-1.5 rounded-lg font-mono font-black text-sm border border-slate-200">
                                                        {item.code}
                                                    </code>
                                                    <button onClick={() => copyToClipboard(item.code)} className="text-slate-300 hover:text-indigo-600">
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 font-medium">
                                                {format(parseISO(item.CreatedAt), "MMM d")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">{item.UsedCount} / {item.MaxUses} Slots</span>
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500"
                                                            style={{ width: `${(item.UsedCount / item.MaxUses) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock size={14} className="text-slate-300" />
                                                    <span className={cn(
                                                        "font-bold",
                                                        new Date(item.Expiry) < new Date() ? "text-rose-500" : "text-slate-700"
                                                    )}>
                                                        {format(parseISO(item.Expiry), "MMM d")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                    onClick={() => handleDelete(item.code)}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <Inbox className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-slate-900 font-bold">No invite codes found</p>
                                                    <p className="text-slate-500 text-sm">
                                                        {searchQuery
                                                            ? `We couldn't find any code matching "${searchQuery}"`
                                                            : "Start by generating a new invite code."}
                                                    </p>
                                                </div>
                                                {searchQuery && (
                                                    <Button
                                                        variant="link"
                                                        onClick={() => setSearchQuery("")}
                                                        className="text-indigo-600 font-semibold"
                                                    >
                                                        Clear search
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    <p className="text-3xl font-black text-slate-900">{value}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">{icon}</div>
            </div>
        </Card>
    )
}