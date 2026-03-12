"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	Building2,
	CalendarDays,
	Ticket,
	Plus,
	Edit3,
	Save,
	MapPinned,
	Activity,
	CalendarClock,
	Trash2,
	ArrowLeft,
	Users,
	Loader2,
	Mail,
	Phone,
	DollarSign,
	Heart,
	Building,
	X,
	MapPin,
	ArrowRight,
	Globe,
	Search,
	Layers,
	UtensilsCrossed,
	Info,
	FileText,
	BadgeCheck,
	LayoutGrid,
	Calendar,
	Sparkles,
	AlertCircle,
	Hash,
	Download,
	ShieldCheck,
	Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	useAddorganizationsMutation,
	useDeleteorganizationMutation,
	useEditorganizationsMutation,
	useGetorganizationsQuery,
} from "@/store/features/organization";
import { useEditMembersMutation } from "@/store/features/members";
import { toast } from "sonner";
import {
	useAddratesMutation,
	useDeleteratesMutation,
	useEditratesMutation,
	useGetratesQuery,
} from "@/store/features/rates-feature ";
import { set } from "date-fns";
import {
	useAddeventsMutation,
	useDeleteeventsMutation,
	useEditeventsMutation,
	useGeteventsQuery,
	useGetRegisteredEventQuery,
    useEditRegisteredEventMutation,
	useDeleteRegisteredEventMutation,
} from "@/store/features/event-feature";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";


interface EventMaster {
	event_id: number;
	org_id: number;
	event_nm: string;
	event_date: string;
	event_alt_date: string;
	event_venue_address_ln1: string;
	event_venue_address_ln2: string;
	event_venue_city: string;
	event_venue_state: string;
	event_venue_zip: string;
	event_active_flg: "Y" | "N";
}

interface RatePlanMaster {
	rate_plan_id: number;
	event_id: number;
	rate_plan_nm: string;
	rate_plan_cd: string;
	rate_plan_details: string;
	rate_plan_eff_dt: string;
	rate_plan_end_dt: string;
	rate_plan_adult_count: number;
	rate_plan_child_count: number;
	rate_plan_adult_amount: number;
	rate_plan_child_amount: number;
}

interface EventRegistration {
	event_registration_num: string;
	primary_guest_email: string;
	event_registration_date: string;
	event_id: number;
	rate_plan_id: number;
	primary_guest_name: string;
	primary_guest_address: string;
	primary_guest_ph: string;
	member_id: number;
	adult_count: number;
	child_count: number;
	student_count: number;
	senior_count: number;
	total_amount: number;
	additional_donation: number;
	additional_donation_type: string;
}

export default function MasterERDSystem() {
	const [activeTab, setActiveTab] = useState("org");
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

	const { data, isLoading: isOrganizationLoading } = useGetorganizationsQuery(
		{ limit: 1000 },
		{ skip: activeTab !== "org" && activeTab !== "event" }
	);
	const org_data = data?.data;

	const { data: rateData, isLoading: isRateLoading } = useGetratesQuery(
		{ limit: 1000 },
		{ skip: activeTab !== "rate" && activeTab !== "event" }
	);
	const rate_data = rateData?.data;

	const { data: eventData, isLoading: isEventLoading } = useGeteventsQuery(
		{ limit: 1000 },
		{ skip: activeTab !== "event" }
	);
	const event_data = eventData?.data;

	// --- GLOBAL STATES ---
	const [orgs, setOrgs] = useState<any[]>([]);
	const [events, setEvents] = useState<EventMaster[]>([
		{
			event_id: 101,
			org_id: 1,
			event_nm: "JECLAT 2k26",
			event_date: "2026-02-14",
			event_alt_date: "2026-02-15",
			event_venue_address_ln1: "Main Campus",
			event_venue_address_ln2: "Auditorium",
			event_venue_city: "Jalpaiguri",
			event_venue_state: "WB",
			event_venue_zip: "73510",
			event_active_flg: "Y",
		},
	]);
	const [rates, setRates] = useState<RatePlanMaster[]>([
		{
			rate_plan_id: 501,
			event_id: 101,
			rate_plan_nm: "Standard Entry",
			rate_plan_cd: "STD01",
			rate_plan_eff_dt: "2026-01-01",
			rate_plan_end_dt: "2026-02-10",
			rate_plan_adult_count: 1,
			rate_plan_child_count: 0,
			rate_plan_adult_amount: 500.0,
			rate_plan_child_amount: 250.0,
			rate_plan_details: "Standard Entry",
		},
	]);

	const [registrations] = useState<EventRegistration[]>([
		{
			event_registration_num: "REG-001",
			primary_guest_email: "souhardya@example.com",
			event_registration_date: "2026-02-01",
			event_id: 101,
			rate_plan_id: 501,
			primary_guest_name: "Souhardya Deb",
			primary_guest_address: "Jalpaiguri, WB",
			primary_guest_ph: "+91 9876543210",
			member_id: 1001,
			adult_count: 2,
			child_count: 1,
			student_count: 0,
			senior_count: 0,
			total_amount: 1250.0,
			additional_donation: 100.0,
			additional_donation_type: "Fest Fund",
		},
	]);

	return (
		<div className="min-h-screen bg-slate-50   font-sans">
			<div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
				{selectedEventId ? (
					<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
						<div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
							<div className="flex items-center gap-4">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setSelectedEventId(null)}
									className="rounded-full shadow-sm">
									<ArrowLeft
										size={16}
										className="mr-2"
									/>{" "}
									Back
								</Button>
								<div>
									<h2 className="text-xl md:text-2xl font-black">
										{
											events.find((e) => String(e.event_id) === selectedEventId)
												?.event_nm
										}
									</h2>
									<p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
										Registration Master
									</p>
								</div>
							</div>
						</div>
						<RegistrationModule
							event_id={selectedEventId}
						/>
					</div>
				) : (
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="space-y-6">
						<div className="overflow-x-auto pb-2">
							<TabsList className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex h-auto min-w-max md:min-w-0">
								<TabsTrigger
									value="org"
									className="rounded-xl px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-[#171e41] data-[state=active]:text-white gap-2 font-bold text-[10px] md:text-xs uppercase transition-all">
									<Building2 size={16} /> Organization
								</TabsTrigger>
								<TabsTrigger
									value="event"
									className="rounded-xl px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-[#171e41] data-[state=active]:text-white gap-2 font-bold text-[10px] md:text-xs uppercase transition-all">
									<CalendarDays size={16} /> Event Master
								</TabsTrigger>
								<TabsTrigger
									value="rate"
									className="rounded-xl px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-[#171e41] data-[state=active]:text-white gap-2 font-bold text-[10px] md:text-xs uppercase transition-all">
									<Ticket size={16} /> Rate Plans
								</TabsTrigger>
							</TabsList>
						</div>

						{isOrganizationLoading ? (
							<div className="flex h-64 w-full items-center justify-center">
								<Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
							</div>
						) : (
							<TabsContent
								value="org"
								className="animate-in fade-in duration-300">
								<OrganizationModule
									data={org_data || []}
									onUpdate={setOrgs}
								/>
							</TabsContent>
						)}

						<TabsContent
							value="event"
							className="animate-in fade-in duration-300">
							<EventModule
								data={event_data || []}
								orgs={org_data || []}
								rates={rate_data || []}
								isLoading={isEventLoading}
								onUpdate={setEvents}
								onSelectEvent={setSelectedEventId}
							/>
						</TabsContent>
						<TabsContent
							value="rate"
							className="animate-in fade-in duration-300">
							<RateModule
								data={rate_data || []}
								events={events}
								onUpdate={setRates}
							/>
						</TabsContent>
					</Tabs>
				)}
			</div>
		</div>
	);
}

// --- 1. ORGANIZATION MODULE ---

// Initial state constant to keep things clean
const INITIAL_FORM_STATE = {
	org_name: "",
	org_type: "Educational",
	street_address: "",
	city: "",
	state: "",
	zip: "",
	org_phone: "",
	org_email: "",
};

function OrganizationModule({ data, onUpdate }: { data: any[]; onUpdate?: (data: any[]) => void }) {
	const [editingId, setEditingId] = useState<number | null>(null);
	const [isCreatingNew, setIsCreatingNew] = useState(false);
	const [form, setForm] = useState(INITIAL_FORM_STATE);

	const [createOrg, { isLoading: isCreating }] = useAddorganizationsMutation();
	const [updateOrg, { isLoading: isUpdating }] = useEditorganizationsMutation();
	const [deleteOrg, { isLoading: isDeleting }] = useDeleteorganizationMutation();

	const handleInputChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const resetState = () => {
		setEditingId(null);
		setIsCreatingNew(false);
		setForm(INITIAL_FORM_STATE);
	};

	const handleSave = async (id?: string) => {
		if (id) {
			toast.promise(updateOrg({ org_id: id, data: form }).unwrap(), {
				loading: "Updating...",
				success: () => {
					resetState();
					return "Updated successfully";
				},
				error: (err) => err?.data?.message || "Operation failed",
			});
		} else {
			toast.promise(createOrg(form).unwrap(), {
				loading: "Creating...",
				success: () => {
					resetState();
					return "Created successfully";
				},
				error: (err) => err?.data?.message || "Operation failed",
			});
		}
	};

	const handleStartEdit = (org: any) => {
		setEditingId(org.org_id);
		setIsCreatingNew(false);
		setForm({ ...org });
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure? This action cannot be undone.")) {
			toast.promise(deleteOrg(id).unwrap(), {
				loading: "Deleting...",
				success: "Deleted successfully",
				error: "Delete failed",
			});
		}
	};

	return (
		<Card className="rounded-[1.5rem] border-none shadow-xl bg-white overflow-hidden">
			<CardHeader className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<CardTitle className="text-xl font-black flex items-center gap-2">
						<Building className="text-indigo-600" /> Organization Master
					</CardTitle>
					<CardDescription>Manage institutional entities and contact details</CardDescription>
				</div>
				{!isCreatingNew && (
					<Button onClick={() => setIsCreatingNew(true)} className="rounded-xl bg-indigo-600">
						<Plus size={18} className="mr-2" /> New Entry
					</Button>
				)}
			</CardHeader>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-slate-50">
						<TableRow>
							<TableHead className="w-16 px-6">ID</TableHead>
							<TableHead>Organization Details</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Contact</TableHead>
							<TableHead className="text-right px-6">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* Inline Creation Row */}
						{isCreatingNew && (
							<TableRow className="bg-indigo-50/30">
								<TableCell className="px-6 italic text-slate-400">New</TableCell>
								<TableCell>
									<div className="space-y-2">
										<Input placeholder="Name" value={form.org_name} onChange={(e) => handleInputChange("org_name", e.target.value)} />
										<Input placeholder="Type (e.g. NGO)" value={form.org_type} onChange={(e) => handleInputChange("org_type", e.target.value)} />
									</div>
								</TableCell>
								<TableCell>
									<div className="grid grid-cols-2 gap-2">
										<Input className="col-span-2" placeholder="Street" value={form.street_address} onChange={(e) => handleInputChange("street_address", e.target.value)} />
										<Input placeholder="City" value={form.city} onChange={(e) => handleInputChange("city", e.target.value)} />
										<Input placeholder="Zip" value={form.zip} onChange={(e) => handleInputChange("zip", e.target.value)} />
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-2">
										<Input placeholder="Email" value={form.org_email} onChange={(e) => handleInputChange("org_email", e.target.value)} />
										<Input placeholder="Phone" value={form.org_phone} onChange={(e) => handleInputChange("org_phone", e.target.value)} />
									</div>
								</TableCell>
								<TableCell className="text-right px-6">
									<div className="flex justify-end gap-2">
										<Button size="sm" variant="ghost" onClick={resetState}><X size={16} /></Button>
										<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSave()} disabled={isCreating}>
											{isCreating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						)}

						{/* Empty State */}
						{!isCreatingNew && data.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} className="h-64 text-center text-slate-400">
									<div className="flex flex-col items-center justify-center">
										<Building2 size={48} className="mb-4 opacity-20" />
										<p className="font-bold italic">
											No organizations found. Create your first entry to get started.
										</p>
									</div>
								</TableCell>
							</TableRow>
						)}

						{data.map((org) => (
							<TableRow key={org.org_id}>
								<TableCell className="px-6 font-mono text-xs text-indigo-600 font-bold">#{org.org_id}</TableCell>

								{/* Editable/Static Name & Type */}
								<TableCell>
									{editingId === org.org_id ? (
										<div className="space-y-2">
											<Input value={form.org_name} onChange={(e) => handleInputChange("org_name", e.target.value)} />
											<Input value={form.org_type} onChange={(e) => handleInputChange("org_type", e.target.value)} />
										</div>
									) : (
										<div className="flex flex-col">
											<span className="font-bold">{org.org_name}</span>
											<Badge variant="secondary" className="w-fit text-[10px] mt-1">{org.org_type}</Badge>
										</div>
									)}
								</TableCell>

								{/* Editable/Static Location */}
								<TableCell>
									{editingId === org.org_id ? (
										<div className="grid grid-cols-2 gap-2">
											<Input className="col-span-2" value={form.street_address} onChange={(e) => handleInputChange("street_address", e.target.value)} />
											<Input value={form.city} onChange={(e) => handleInputChange("city", e.target.value)} />
											<Input value={form.state} onChange={(e) => handleInputChange("state", e.target.value)} />
										</div>
									) : (
										<div className="text-xs text-slate-600 space-y-1">
											<div className="flex items-center gap-1"><MapPin size={12} /> {org.street_address}</div>
											<div>{org.city}, {org.state} {org.zip}</div>
										</div>
									)}
								</TableCell>

								{/* Editable/Static Contact */}
								<TableCell>
									{editingId === org.org_id ? (
										<div className="space-y-2">
											<Input value={form.org_email} onChange={(e) => handleInputChange("org_email", e.target.value)} />
											<Input value={form.org_phone} onChange={(e) => handleInputChange("org_phone", e.target.value)} />
										</div>
									) : (
										<div className="text-xs text-slate-600 space-y-1">
											<div className="flex items-center gap-1"><Mail size={12} /> {org.org_email}</div>
											<div className="flex items-center gap-1"><Phone size={12} /> {org.org_phone}</div>
										</div>
									)}
								</TableCell>

								{/* Actions */}
								<TableCell className="text-right px-6">
									<div className="flex justify-end gap-1">
										{editingId === org.org_id ? (
											<>
												<Button variant="ghost" size="sm" onClick={resetState}><X size={16} /></Button>
												<Button variant="ghost" size="sm" onClick={() => handleSave(org.org_id)}>
													<Save size={16} className={isUpdating ? "animate-pulse" : "text-emerald-600"} />
												</Button>
											</>
										) : (
											<>
												<Button variant="ghost" size="sm" onClick={() => handleStartEdit(org)}><Edit3 size={16} /></Button>
												<Button variant="ghost" size="sm" onClick={() => handleDelete(org.org_id)} className="text-red-400"><Trash2 size={16} /></Button>
											</>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</Card>
	);
}

// --- 2. EVENT MODULE ---
function EventEditForm({ initialData, orgs, rates, onSave, onCancel, isProcessing }: any) {
	const [formData, setFormData] = useState({
		...initialData,
		event_alt_date: initialData.event_alt_date || "",
		event_end_time: initialData.event_end_time || "",
		rate_plan_ids: initialData.rate_plans
			? initialData.rate_plans.map((rp: any) => rp.rate_plan_id.toString())
			: (initialData.rate_plan_ids || [])
	});

	const handleChange = (field: string, value: any) => {
		setFormData((prev: any) => ({ ...prev, [field]: value }));
	};

	const isOnline = formData.event_mode === "Online";

	return (
		<Card className="rounded-[2.5rem] border-2 border-indigo-500 shadow-2xl bg-white overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
			<div className="grid grid-cols-1 lg:grid-cols-12">
				{/* Left Sidebar: Identity & Rates */}
				<div className="lg:col-span-3 bg-slate-50 p-8 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between">
					<div className="space-y-6">
						<div className="space-y-2">
							<Label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Event Identity</Label>
							<Input className="text-xl font-bold bg-white rounded-xl h-12" value={formData.event_name} onChange={(e) => handleChange("event_name", e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization</Label>
							<Select value={formData.org_id?.toString()} onValueChange={(v) => handleChange("org_id", v)}>
								<SelectTrigger className="rounded-xl h-12 font-semibold"><SelectValue /></SelectTrigger>
								<SelectContent>{orgs.map((o: any) => <SelectItem key={o.org_id} value={o.org_id.toString()}>{o.org_name}</SelectItem>)}</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate Plans</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-start h-12 rounded-xl text-left font-semibold bg-white border-slate-200">
										{formData.rate_plan_ids?.length ? `${formData.rate_plan_ids.length} Selected` : "Select Rates"}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56 rounded-xl" align="start">
									{rates?.map((r: any) => (
										<DropdownMenuCheckboxItem
											key={r.rate_plan_id}
											checked={formData.rate_plan_ids.includes(r.rate_plan_id.toString())}
											onCheckedChange={(checked) => {
												const current = [...formData.rate_plan_ids];
												const updated = checked
													? [...current, r.rate_plan_id.toString()]
													: current.filter(id => id !== r.rate_plan_id.toString());
												handleChange("rate_plan_ids", updated);
											}}
										>
											{r.rate_plan_name}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className="flex gap-2 mt-8">
						<Button className="flex-1 rounded-xl h-12 bg-indigo-600 font-bold" onClick={() => onSave(formData)} disabled={isProcessing}>
							<Save size={18} className="mr-2" /> Save
						</Button>
						<Button variant="outline" className="rounded-xl h-12 px-4" onClick={onCancel}><X size={18} /></Button>
					</div>
				</div>

				{/* Right Content: Logistics & restored Scheduling */}
				<div className="lg:col-span-9 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white">
					{/* Logistics Section */}
					<div className="space-y-8">
						<h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><div className="h-6 w-1 bg-indigo-500 rounded-full" /> Logistics</h3>
						<div className="flex gap-4">
							<Button variant={!isOnline ? "default" : "outline"} className={`flex-1 rounded-2xl h-14 ${!isOnline ? 'bg-slate-900' : ''}`} onClick={() => handleChange("event_mode", "Offline")}>
								<MapPinned size={18} className="mr-2" /> Physical
							</Button>
							<Button variant={isOnline ? "default" : "outline"} className={`flex-1 rounded-2xl h-14 ${isOnline ? 'bg-indigo-600' : ''}`} onClick={() => handleChange("event_mode", "Online")}>
								<Globe size={18} className="mr-2" /> Virtual
							</Button>
						</div>
						<div className="space-y-4">
							{isOnline ? (
								<div className="space-y-2">
									<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Broadcast Link</Label>
									<Input
										className="h-12 rounded-xl bg-slate-50"
										placeholder="https://zoom.us/j/..."
										value={formData.event_broadcast_link || ""}
										onChange={(e) => handleChange("event_broadcast_link", e.target.value)}
									/>
								</div>
							) : (
								<div className="grid gap-3">
									<div className="space-y-1">
										<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Address Line 1</Label>
										<Input
											className="h-12 rounded-xl bg-slate-50"
											placeholder="Street Address, P.O. box"
											value={formData.event_venue_address_ln1 || ""}
											onChange={(e) => handleChange("event_venue_address_ln1", e.target.value)}
										/>
									</div>

									<div className="space-y-1">
										<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Address Line 2 (Optional)</Label>
										<Input
											className="h-12 rounded-xl bg-slate-50"
											placeholder="Apartment, suite, unit, building, floor, etc."
											value={formData.event_venue_address_ln2 || ""}
											onChange={(e) => handleChange("event_venue_address_ln2", e.target.value)}
										/>
									</div>

									<div className="grid grid-cols-3 gap-3">
										<div className="space-y-1">
											<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">City</Label>
											<Input
												className="h-12 rounded-xl bg-slate-50"
												placeholder="City"
												value={formData.event_venue_city || ""}
												onChange={(e) => handleChange("event_venue_city", e.target.value)}
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">State</Label>
											<Input
												className="h-12 rounded-xl bg-slate-50"
												placeholder="State"
												value={formData.event_venue_state || ""}
												onChange={(e) => handleChange("event_venue_state", e.target.value)}
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Zip</Label>
											<Input
												className="h-12 rounded-xl bg-slate-50"
												placeholder="Zip"
												value={formData.event_venue_zip || ""}
												onChange={(e) => handleChange("event_venue_zip", e.target.value)}
											/>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Scheduling Section (Restored fields) */}
					<div className="space-y-8">
						<h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><div className="h-6 w-1 bg-amber-500 rounded-full" /> Scheduling</h3>
						<div className="space-y-6">
							<div className="flex gap-4">
								<div className="flex-1 space-y-1.5">
									<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Primary Date</Label>
									<Input type="date" className="h-12 rounded-xl" value={formData.event_date} onChange={(e) => handleChange("event_date", e.target.value)} />
								</div>
								<div className="flex-1 space-y-1.5">
									<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Alt Date (Opt)</Label>
									<Input type="date" className="h-12 rounded-xl text-slate-400" value={formData.event_alt_date} onChange={(e) => handleChange("event_alt_date", e.target.value)} />
								</div>
							</div>
							<div className="flex gap-4">
								<div className="flex-1 space-y-1.5">
									<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Start Time</Label>
									<Input type="time" className="h-12 rounded-xl" value={formData.event_start_time || ""} onChange={(e) => handleChange("event_start_time", e.target.value)} />
								</div>
								<div className="flex-1 space-y-1.5">
									<Label className="text-[10px] font-bold text-slate-500 uppercase pl-1">End Time</Label>
									<Input type="time" className="h-12 rounded-xl" value={formData.event_end_time || ""} onChange={(e) => handleChange("event_end_time", e.target.value)} />
								</div>
							</div>
							<div className="flex items-center justify-between pt-4 border-t border-slate-100">
								<span className="text-xs font-bold text-slate-500">Publication Status</span>
								<Badge onClick={() => handleChange("event_active_flg", !formData.event_active_flg)} className={`px-4 py-1.5 cursor-pointer transition-colors ${formData.event_active_flg ? 'bg-emerald-500' : 'bg-slate-200 text-slate-700'}`}>
									{formData.event_active_flg ? 'PUBLISHED' : 'DRAFT'}
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}

// --- MAIN MODULE ---
function EventModule({ data, orgs, rates, isLoading, onSelectEvent }: any) {
	const [editId, setEditId] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [tempNewEvent, setTempNewEvent] = useState<any | null>(null);

	const [addEvent] = useAddeventsMutation();
	const [editEvent] = useEditeventsMutation();
	const [deleteEvent] = useDeleteeventsMutation();

	const getParts = (dateStr: string) => {
		if (!dateStr) return { month: "TBA", day: "00", year: "----" };
		const d = new Date(dateStr);
		return {
			month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
			day: String(d.getDate()).padStart(2, '0'),
			year: d.getFullYear()
		};
	};

	const handleAddNewEvent = () => {
		const tempId = `NEW_${Date.now()}`;
		setTempNewEvent({
			event_id: tempId,
			org_id: orgs[0]?.org_id || "",
			event_name: "New Event",
			event_date: new Date().toISOString().split("T")[0],
			event_alt_date: "",
			event_start_time: "",
			event_end_time: "",
			event_mode: "Offline",
			rate_plan_ids: [],
			event_active_flg: true,
		});
		setEditId(tempId);
	};

	const handleSave = async (payload: any) => {
		setIsProcessing(true);
		try {
			if (editId?.startsWith("NEW_")) {
				const { event_id, ...dataToSend } = payload;
				toast.promise(addEvent(dataToSend).unwrap(), {
					loading: "Creating event...",
					success: () => { setTempNewEvent(null); setEditId(null); return "Event Created!"; },
					error: (e: any) => { toast.error(e.data.message); return "Creation failed"; },
				});
			} else {
				toast.promise(editEvent({ event_id: editId || "", data: payload }).unwrap(), {
					loading: "Updating...",
					success: () => { setEditId(null); return "Changes Saved!"; },
					error: (e: any) => { toast.error(e.data.message); return "Update failed"; },
				});
			}
		} catch (e) { console.error(e); } finally { setIsProcessing(false); }
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this event?")) return;
		try {
			await toast.promise(deleteEvent(id).unwrap(), {
				loading: "Deleting...",
				success: "Deleted!",
				error: "Delete failed",
			});
		} catch (e) { console.error(e); }
	};

	const displayList = tempNewEvent ? [tempNewEvent, ...(data || [])] : (data || []);
	const filteredEvents = displayList.filter((e: any) => e.event_name.toLowerCase().includes(searchTerm.toLowerCase()));

	return (
		<div className="space-y-8 pb-20 max-w-[1600px] mx-auto px-4">
			<div className="sticky top-4 z-40 border border-slate-200 p-4 rounded-3xl flex items-center justify-end gap-4 shadow-sm">
				<div className="relative max-w-xs w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
					<Input placeholder="Search events..." className="pl-10 rounded-xl bg-white border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
				</div>
				<Button onClick={handleAddNewEvent} disabled={!!editId} className="rounded-xl bg-slate-900 px-6 h-11">
					<Plus size={20} className="mr-2" /> New Event
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-6">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center p-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] animate-in fade-in zoom-in duration-500">
						<Loader2 className="w-12 h-12 animate-spin text-indigo-300 mb-6" />
						<h3 className="text-xl font-black text-slate-700 mb-2">Loading Events...</h3>
					</div>
				) : filteredEvents.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] animate-in fade-in zoom-in duration-500">
						<div className="bg-white p-6 rounded-full shadow-sm mb-6"><CalendarDays size={48} className="text-indigo-200" /></div>
						<h3 className="text-xl font-black text-slate-700 mb-2">No Events Found</h3>
						{!editId && <Button onClick={handleAddNewEvent} className="rounded-2xl bg-indigo-600 h-12 px-8 font-bold text-white shadow-lg shadow-indigo-100">Quick Create</Button>}
					</div>
				) : (
					filteredEvents.map((evt: any) => {
						const isEditing = editId === evt.event_id;
						const dateParts = getParts(evt.event_date);

						// Match Rate IDs to Names for Display
						const assignedRatePlanIds = evt.rate_plans
							? evt.rate_plans.map((rp: any) => rp.rate_plan_id.toString())
							: (evt.rate_plan_ids || []);

						if (isEditing) {
							return (
								<EventEditForm
									key={evt.event_id}
									initialData={evt}
									orgs={orgs}
									rates={rates}
									isProcessing={isProcessing}
									onSave={handleSave}
									onCancel={() => { setEditId(null); setTempNewEvent(null); }}
								/>
							);
						}

						return (
							<Card key={evt.event_id} className="group rounded-[2rem] border border-slate-100 bg-white hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl overflow-hidden">
								<div className="flex flex-col md:flex-row items-stretch">
									<div className="md:w-32 bg-slate-50 flex flex-col items-center justify-center p-6 group-hover:bg-indigo-50/50 transition-colors">
										<span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{dateParts.month}</span>
										<span className="text-4xl font-black text-slate-800 my-1">{dateParts.day}</span>
										<span className="text-[10px] font-bold text-slate-400">{dateParts.year}</span>
									</div>
									<div className="flex-1 p-8 flex flex-col md:flex-row justify-between gap-6">
										<div className="space-y-3">
											<div className="flex items-center gap-2 flex-wrap">
												<Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter">
													{orgs.find((o: any) => o.org_id === evt.org_id)?.org_name || "Internal"}
												</Badge>

												{/* RESTORED RATE PLAN BADGES */}
												{assignedRatePlanIds.map((rId: string) => {
													const matchedRate = rates?.find((r: any) => r.rate_plan_id.toString() === rId);
													return matchedRate ? (
														<Badge key={rId} variant="secondary" className="text-[9px] uppercase font-bold tracking-tighter bg-indigo-50 text-indigo-600 border-none">
															{matchedRate.rate_plan_name}
														</Badge>
													) : null;
												})}

												<div className={`h-2 w-2 rounded-full ${evt.event_active_flg ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
											</div>
											<h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{evt.event_name}</h3>
											<div className="flex flex-wrap gap-4 text-slate-500 text-sm font-semibold pt-1">
												<div className="flex items-center gap-1.5"><CalendarClock size={14} className="text-slate-400" /> {evt.event_start_time || 'TBA'} - {evt.event_end_time || 'TBA'}</div>
												<div className="flex items-center gap-1.5"><MapPinned size={14} className="text-slate-400" /> {evt.event_mode}</div>
											</div>
										</div>
										<div className="flex items-center md:items-end gap-2">
											<Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-indigo-50 hover:text-indigo-600" onClick={() => setEditId(evt.event_id)}><Edit3 size={18} /></Button>
											<Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500" onClick={() => handleDelete(evt.event_id)}><Trash2 size={18} /></Button>
											<Button onClick={() => onSelectEvent(evt.event_id)} className="rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-900 hover:text-white px-6 font-bold shadow-sm transition-all ml-2 h-11">
												Explore <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
											</Button>
										</div>
									</div>
								</div>
							</Card>
						);
					})
				)}
			</div>
		</div>
	);
}
interface RatePlan {
	rate_plan_id?: string;
	rate_plan_name: string;
	rate_plan_code: string;
	rate_plan_details: string;
	effective_date: string;
	end_date: string;
	adult_count: number;
	child_count: number;
	teen_count: number;
	senior_count: number;
	adult_amount: number;
	child_amount: number;
	teen_amount: number;
	senior_amount: number;
	adult_member_food: number;
	adult_non_member_food: number;
	refund_percentage: number;
	created_at?: string;
}

export function RateModule({ data }: any) {
	const [editId, setEditId] = useState<number | string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [localRates, setLocalRates] = useState<any[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	// Mutations
	const [addRates] = useAddratesMutation();
	const [updateRate] = useEditratesMutation();
	const [deleteRate] = useDeleteratesMutation();

	useEffect(() => {
		if (data) setLocalRates(data);
	}, [data]);

	const updateLocalField = (id: any, field: string, value: any) => {
		setLocalRates((prev) =>
			prev.map((r) => (r.rate_plan_id === id ? { ...r, [field]: value } : r))
		);
	};

	const handleAddNew = () => {
		const tempId = `temp-${Date.now()}`;
		const newPlan = {
			rate_plan_id: tempId,
			rate_plan_name: "",
			rate_plan_cd: "NEW-PLAN",
			plan_details: "",
			rate_plan_cost: 0,
			eff_date: new Date().toISOString().split("T")[0],
			end_date: "",
			rate_plan_for_member: false, // Default value
		};
		setLocalRates([newPlan, ...localRates]);
		setEditId(tempId);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSave = async (id: any) => {
		const target = localRates.find((r) => r.rate_plan_id === id);
		if (!target) return;

		if (!target.rate_plan_name) {
			toast.error("Rate name is required");
			return;
		}

		setIsProcessing(true);
		try {
			if (typeof id === "string" && id.startsWith("temp-")) {
				const { rate_plan_id, ...payload } = target;

				await addRates(payload).unwrap();
				toast.success("New Rate created successfully");
			} else {
				await updateRate({ rate_plan_id: id, data: target }).unwrap();
				toast.success("Rate synchronized");
			}
			setEditId(null);
		} catch (e: any) {
			toast.error(e?.data?.message || "Operation failed");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDelete = async (id: any) => {
		const isTemp = typeof id === "string" && id.startsWith("temp-");
		if (!isTemp && !confirm("Permanently delete this Rate?")) return;

		if (isTemp) {
			setLocalRates(localRates.filter((r) => r.rate_plan_id !== id));
			if (editId === id) setEditId(null);
			return;
		}

		setIsProcessing(true);
		try {
			await deleteRate(id).unwrap();
			setLocalRates(localRates.filter((r) => r.rate_plan_id !== id));
			toast.success("Rate removed");
		} catch (e: any) {
			toast.error("Failed to delete Rate");
		} finally {
			setIsProcessing(false);
		}
	};

	const filteredRates = localRates.filter(
		(r) =>
			r.rate_plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			r.rate_plan_cd?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="space-y-10 max-w-7xl mx-auto ">
			{/* HEADER */}
			<div className="flex flex-col md:flex-row justify-end items-center gap-6 ">
				<div className="flex gap-3 w-full md:w-auto">
					<div className="relative flex-1 md:w-64">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
						<Input
							placeholder="Search plans..."
							className="pl-10 h-12 rounded-2xl border-slate-200 focus:ring-2 focus:ring-indigo-100"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						onClick={handleAddNew}
						disabled={isProcessing}
						className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-all active:scale-95"
					>
						<Plus size={20} className="mr-2" /> New Rate
					</Button>
				</div>
			</div>

			{/* LIST */}
			<div className="grid grid-cols-1 gap-6">
				{filteredRates.length === 0 ? (
					<div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
						<AlertCircle className="mx-auto text-slate-500 mb-4" size={48} />
						<p className="text-slate-500 font-bold">No rates found matching your criteria.</p>
					</div>
				) : (
					<div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader className="bg-slate-50/80">
									<TableRow>
										<TableHead className="w-[20%] px-6 py-4 font-black text-[10px] uppercase text-slate-400 tracking-widest">Rate Plan Name & Code</TableHead>
										<TableHead className="w-[15%] font-black text-[10px] uppercase text-slate-400 tracking-widest">Standard Cost</TableHead>
										<TableHead className="w-[15%] font-black text-[10px] uppercase text-slate-400 tracking-widest">Audience</TableHead>
										<TableHead className="w-[20%] font-black text-[10px] uppercase text-slate-400 tracking-widest">Active Cycle</TableHead>
										<TableHead className="w-[20%] font-black text-[10px] uppercase text-slate-400 tracking-widest">Scope Details</TableHead>
										<TableHead className="w-[10%] font-black text-[10px] uppercase text-slate-400 tracking-widest text-right px-6">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredRates.map((rp) => {
										const isEditing = editId === rp.rate_plan_id;
										const isTemp = typeof rp.rate_plan_id === "string" && rp.rate_plan_id.startsWith("temp-");

										return (
											<TableRow
												key={rp.rate_plan_id}
												className={`group transition-colors hover:bg-slate-50/50 ${isEditing ? 'bg-indigo-50/30 hover:bg-indigo-50/40' : ''}`}
											>
												{/* Name & Code */}
												<TableCell className="px-6 py-4 align-top">
													{isEditing ? (
														<div className="space-y-3">
															<div className="space-y-1">
																<Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Plan Name</Label>
																<Input className="h-9 text-sm font-bold border-indigo-100" value={rp.rate_plan_name} onChange={(e) => updateLocalField(rp.rate_plan_id, "rate_plan_name", e.target.value)} />
															</div>
															<div className="space-y-1">
																<Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">System Code</Label>
																<Input className="h-8 text-xs font-mono uppercase" value={rp.rate_plan_cd} onChange={(e) => updateLocalField(rp.rate_plan_id, "rate_plan_cd", e.target.value)} />
															</div>
														</div>
													) : (
														<div>
															<div className="font-bold text-slate-900 text-base mb-1">{rp.rate_plan_name}</div>
															<Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-500">
																{rp.rate_plan_cd}
															</Badge>
														</div>
													)}
												</TableCell>

												{/* Cost */}
												<TableCell className="align-top">
													<div className="flex items-center gap-1 font-bold">
														<span className="text-indigo-500 text-sm">$</span>
														{isEditing ? (
															<div className="flex flex-col gap-1">
																<Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Standard Rate</Label>
																<Input type="number" className="h-9 w-24 text-right font-bold text-sm border-indigo-100" value={rp.rate_plan_cost} onChange={(e) => updateLocalField(rp.rate_plan_id, "rate_plan_cost", parseFloat(e.target.value))} />
															</div>
														) : (
															<span className="text-slate-900 text-lg">{parseFloat(rp.rate_plan_cost).toLocaleString()}</span>
														)}
													</div>
												</TableCell>

												{/* Audience (NEW FIELD) */}
												<TableCell className="align-top">
													{isEditing ? (
														<div className="flex flex-col gap-2 pt-2">
															<Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Restrictions</Label>
															<div className="flex items-center space-x-2">
																<Checkbox
																	id={`member-${rp.rate_plan_id}`}
																	checked={rp.rate_plan_for_member}
																	onCheckedChange={(checked) => updateLocalField(rp.rate_plan_id, "rate_plan_for_member", !!checked)}
																/>
																<Label htmlFor={`member-${rp.rate_plan_id}`} className="text-xs font-bold text-slate-500 cursor-pointer">Member Only</Label>
															</div>
														</div>
													) : (
														rp.rate_plan_for_member ? (
															<Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-black uppercase">Members Only</Badge>
														) : (
															<Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase">General Public</Badge>
														)
													)}
												</TableCell>

												{/* Lifecycle */}
												<TableCell className="align-top">
													<div className="space-y-2 pt-1">
														<div className="flex items-center gap-2">
															<span className="w-8 text-[9px] font-bold text-slate-400 uppercase">Starts</span>
															{isEditing ? (
																<Input type="date" className="h-8 w-32 border-indigo-100 text-xs font-bold" value={rp.eff_date} onChange={(e) => updateLocalField(rp.rate_plan_id, "eff_date", e.target.value)} />
															) : (
																<span className="text-xs font-medium text-slate-700">{rp.eff_date || "---"}</span>
															)}
														</div>
														<div className="flex items-center gap-2">
															<span className="w-8 text-[9px] font-bold text-slate-400 uppercase">Ends</span>
															{isEditing ? (
																<Input type="date" className="h-8 w-32 border-indigo-100 text-xs font-bold" value={rp.end_date} onChange={(e) => updateLocalField(rp.rate_plan_id, "end_date", e.target.value)} />
															) : (
																<span className="text-xs font-medium text-slate-700">{rp.end_date || "---"}</span>
															)}
														</div>
													</div>
												</TableCell>

												{/* Details */}
												<TableCell className="align-top">
													{isEditing ? (
														<div className="space-y-1">
															<Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Plan Inclusions</Label>
															<Textarea className="min-h-[80px] text-xs resize-none border-indigo-100" value={rp.plan_details} onChange={(e) => updateLocalField(rp.rate_plan_id, "plan_details", e.target.value)} />
														</div>
													) : (
														<p className="text-xs text-slate-500 line-clamp-3 italic">{rp.plan_details || "No details."}</p>
													)}
												</TableCell>

												{/* Actions */}
												<TableCell className="px-6 align-top text-right">
													<div className="flex justify-end items-center gap-2">
														{isEditing ? (
															<div className="flex flex-col gap-2">
																<Button size="sm" onClick={() => handleSave(rp.rate_plan_id)} className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs font-bold min-w-[70px]">
																	{isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Save"}
																</Button>
																<Button variant="ghost" size="sm" onClick={() => isTemp ? handleDelete(rp.rate_plan_id) : setEditId(null)} className="h-8 text-xs font-bold text-slate-400 min-w-[70px]">Cancel</Button>
															</div>
														) : (
															<div className="flex gap-1">
																<Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-indigo-600" onClick={() => setEditId(rp.rate_plan_id)}><Edit3 size={14} /></Button>
																<Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(rp.rate_plan_id)}><Trash2 size={14} /></Button>
															</div>
														)}
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
function RegistrationModule({ event_id }: { event_id: string }) {
    const { data: registeredUsers, isLoading, isError } = useGetRegisteredEventQuery(event_id);
    const [editRegisteredEvent] = useEditRegisteredEventMutation();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReg, setSelectedReg] = useState<any | null>(null);
    const [isEditingReg, setIsEditingReg] = useState(false);
    const [editRegData, setEditRegData] = useState<any>({});
    const [isProcessingEdit, setIsProcessingEdit] = useState(false);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);
	const [deleteRegisteredEvent] = useDeleteRegisteredEventMutation();

    const registrations = registeredUsers?.data || [];

    const handleSaveRegistration = async () => {
        setIsProcessingEdit(true);
        try {
			console.log(selectedReg.event_reg_num);
			
            await editRegisteredEvent({
                event_reg_num: selectedReg.event_reg_num,
                data: editRegData,
            }).unwrap();
            setSelectedReg({ ...selectedReg, ...editRegData });
            setIsEditingReg(false);
            toast.success("Registration updated successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to edit registration");
        } finally {
            setIsProcessingEdit(false);
        }
    };

	const handleDeleteRegistration = async () => {
        setIsProcessingDelete(true);
        try {
            await deleteRegisteredEvent(selectedReg.event_reg_num).unwrap();
            setSelectedReg(null);
            toast.success("Registration deleted successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete registration");
        } finally {
            setIsProcessingDelete(false);
        }
    };

    // --- Filter Logic ---
    const filteredData = useMemo(() => {
        return registrations.filter((reg: any) => 
            reg.primary_guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.event_reg_num.toString().includes(searchTerm)
        );
    }, [registrations, searchTerm]);

    const stats = useMemo(() => {
        const total = filteredData.reduce((acc: number, curr: any) => acc + Number(curr.total_amount), 0);
        const pax = filteredData.reduce((acc: number, curr: any) => 
            acc + curr.selected_plans.reduce((pAcc: number, p: any) => pAcc + p.registered_pax_count, 0), 0);
        return { total, pax };
    }, [filteredData]);

    if (isLoading) return <div className="p-20 text-center animate-pulse font-black text-slate-500 tracking-widest uppercase text-xs">Syncing Registry...</div>;
    if (isError) return <div className="p-20 text-center text-rose-500 font-bold">Error connecting to Registry API.</div>;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 p-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                            placeholder="Search by name, email or ID..." 
                            className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border 		border-slate-50 flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Revenue</p>
                            <p className="text-xl font-black text-emerald-600">${stats.total.toFixed(2)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Pax</p>
                            <p className="text-xl font-black text-slate-900">{stats.pax}</p>
                        </div>
                    </div>
                    {/* <Button variant="outline" className="h-14 w-14 rounded-2xl border-none shadow-sm bg-white text-slate-400 hover:text-indigo-600">
                        <Download size={20} />
                    </Button> */}
                </div>
            </div>

            {/* BROAD MASTER TABLE */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 font-black text-[10px] uppercase text-slate-400 tracking-widest">Guest & Status</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Reference & Plans</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest text-center">Catering</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest text-center">Pax</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest text-right px-8">Financials</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((reg: any) => {
                            const totalPax = reg.selected_plans?.reduce((acc: number, p: any) => acc + p.registered_pax_count, 0) || 0;
                            return (
                                <TableRow 
                                    key={`${reg.email}-${reg.createdAt}`}
                                    className="hover:bg-slate-50/80 transition-all cursor-pointer group border-slate-50"
                                    onClick={() => setSelectedReg(reg)}
                                >
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{reg.primary_guest_name}</span>
                                                {reg.is_member && <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] font-black uppercase px-1.5 h-4">Member</Badge>}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">{reg.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {reg.selected_plans?.map((p: any, i: number) => (
                                                    <Badge key={i} className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase px-2 py-0.5">{p.rate_plan_name}</Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                                <span className="bg-slate-50 px-1 rounded"># {reg.event_reg_num}</span>
                                                <span>•</span>
                                                <span>{new Date(reg.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 font-black text-[10px]">
                                            <span className="text-emerald-500">{reg.veg_count}V</span>
                                            <span className="text-slate-200">|</span>
                                            <span className="text-orange-500">{reg.non_veg_count}N</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-black text-slate-700 text-lg">{totalPax}</span>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-black text-emerald-600 text-xl">${Number(reg.total_amount).toFixed(2)}</span>
                                            <div className="flex items-center gap-1">
                                                {reg.additional_donation > 0 && <Heart size={10} className="text-rose-500" fill="currentColor" />}
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{reg.payment_mode}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>

            {/* --- FULL DETAILS MODAL --- */}
            <Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
                <DialogContent className=" w-full min-w-4xl  rounded-xl p-0  border-none shadow-2xl bg-white">
                    {/* Dark Profile Header */}
                    <div className="bg-[#0a0f1e] rounded-t-xl p-10 text-white relative">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 min-w-[64px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-2xl font-black">
                                        {selectedReg?.primary_guest_name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        {isEditingReg ? (
                                            <>
                                                <Input 
                                                    value={editRegData.primary_guest_name || ''} 
                                                    onChange={(e) => setEditRegData({...editRegData, primary_guest_name: e.target.value})} 
                                                    className="h-10 text-2xl font-black border-none bg-white/10 text-white placeholder-white/50 focus-visible:ring-1 focus-visible:ring-white/30"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center flex-1">
                                                        <Mail size={14} className="text-indigo-400 absolute ml-3" />
                                                        <Input value={editRegData.email || ''} onChange={(e) => setEditRegData({...editRegData, email: e.target.value})} className="h-8 pl-8 text-xs font-bold border-none bg-white/10 text-white" />
                                                    </div>
                                                    <div className="flex items-center flex-1">
                                                        <Phone size={14} className="text-indigo-400 absolute ml-3" />
                                                        <Input value={editRegData.primary_guest_ph || ''} onChange={(e) => setEditRegData({...editRegData, primary_guest_ph: e.target.value})} className="h-8 pl-8 text-xs font-bold border-none bg-white/10 text-white" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h2 className="text-4xl font-black tracking-tight">{selectedReg?.primary_guest_name}</h2>
                                                <p className="text-slate-400 font-bold text-sm flex gap-3 flex-wrap">
                                                    <span className="flex items-center gap-1.5"><Mail size={14} className="text-indigo-400" /> {selectedReg?.email}</span>
                                                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-indigo-400" /> {selectedReg?.primary_guest_ph}</span>
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]">
                                    {selectedReg?.payment_mode} Verified
                                </Badge>
                                <div className="flex flex-col gap-1 items-end mt-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reg No. - {selectedReg?.event_reg_num}</p>
                                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Txn - {selectedReg?.transaction_id || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 grid max-h-[90vh] overflow-y-auto grid-cols-12 gap-8">
                        {/* Column Left: Detailed Breakdown */}
                        <div className="col-span-8 space-y-8">
                            <section>
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <ShieldCheck size={14} /> Rate Plan Details
                                </h3>
                                <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="border-none">
                                                <TableHead className="text-[9px] font-black uppercase px-6">Rate Category</TableHead>
                                                <TableHead className="text-[9px] font-black uppercase text-center">Pax</TableHead>
                                                <TableHead className="text-[9px] font-black uppercase text-right px-6">Unit Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(isEditingReg ? editRegData.selected_plans : selectedReg?.selected_plans)?.map((plan: any, idx: number) => (
                                                <TableRow key={idx} className="border-slate-50 hover:bg-transparent">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-700">{plan.rate_plan_name}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Plan ID: {plan.rate_plan_id}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-black text-center">
                                                        {isEditingReg ? (
                                                            <Input 
                                                                type="number" 
                                                                min="0" 
                                                                value={plan.registered_pax_count || 0} 
                                                                onChange={(e) => {
                                                                    const count = parseInt(e.target.value) || 0;
                                                                    const updatedPlans = [...editRegData.selected_plans];
                                                                    updatedPlans[idx] = { ...updatedPlans[idx], registered_pax_count: count };
                                                                    
                                                                    let newTotal = Number(selectedReg?.additional_donation || 0);
                                                                    updatedPlans.forEach(p => {
                                                                        newTotal += (p.registered_pax_count * Number(p.base_price || 0));
                                                                    });

                                                                    setEditRegData({ ...editRegData, selected_plans: updatedPlans, total_amount: newTotal });
                                                                }} 
                                                                className="h-8 w-32 mx-auto text-center font-bold" 
                                                            />
                                                        ) : (
                                                            plan.registered_pax_count
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right px-6 font-bold text-slate-600">
                                                        ${Number(plan.base_price || 0).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </section>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <h4 className="text-[9px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><Utensils size={12} /> Catering</h4>
                                    <div className="flex items-end gap-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase">Veg</p>
                                            {isEditingReg ? (
                                                <Input type="number" min="0" value={editRegData.veg_count || 0} onChange={(e) => setEditRegData({...editRegData, veg_count: parseInt(e.target.value) || 0})} className="h-10 w-20 text-center font-bold" />
                                            ) : (
                                                <p className="text-3xl font-black text-emerald-600">{selectedReg?.veg_count}</p>
                                            )}
                                        </div>
                                        <div className="h-10 w-px bg-slate-200" />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase">Non-Veg</p>
                                            {isEditingReg ? (
                                                <Input type="number" min="0" value={editRegData.non_veg_count || 0} onChange={(e) => setEditRegData({...editRegData, non_veg_count: parseInt(e.target.value) || 0})} className="h-10 w-20 text-center font-bold" />
                                            ) : (
                                                <p className="text-3xl font-black text-orange-600">{selectedReg?.non_veg_count}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <h4 className="text-[9px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><MapPin size={12} /> Address</h4>
                                    {isEditingReg ? (
                                        <div className="space-y-2">
                                            <Input placeholder="Street" value={editRegData.address_street || ''} onChange={(e) => setEditRegData({...editRegData, address_street: e.target.value})} className="h-8 text-xs font-bold" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input placeholder="City" value={editRegData.address_city || ''} onChange={(e) => setEditRegData({...editRegData, address_city: e.target.value})} className="h-8 text-xs font-bold" />
                                                <Input placeholder="State" value={editRegData.address_state || ''} onChange={(e) => setEditRegData({...editRegData, address_state: e.target.value})} className="h-8 text-xs font-bold" />
                                            </div>
                                            <Input placeholder="Zip" value={editRegData.address_zip || ''} onChange={(e) => setEditRegData({...editRegData, address_zip: e.target.value})} className="h-8 text-xs font-bold" />
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase">
                                            {selectedReg?.address_street}<br />
                                            {selectedReg?.address_city}, {selectedReg?.address_state} {selectedReg?.address_zip}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column Right: Billing & Actions */}
                        <div className="col-span-4 space-y-6">
                            <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center text-center">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Paid</p>
                                <p className="text-5xl font-black text-emerald-700">${Number(isEditingReg && editRegData.total_amount !== undefined ? editRegData.total_amount : selectedReg?.total_amount).toFixed(2)}</p>
                            </div>

                            {selectedReg?.additional_donation > 0 && (
                                <div className="p-6 bg-rose-50 rounded-[2.5rem] border border-rose-100">
                                    <div className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1.5 mb-1">
                                        <Heart size={12} fill="currentColor" /> {selectedReg?.additional_donation_type} Donation
                                    </div>
                                    <p className="text-2xl font-black text-rose-700">${Number(selectedReg?.additional_donation).toFixed(2)}</p>
                                </div>
                            )}

                            <div className="p-6 border border-slate-100 rounded-[2rem] space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Membership</span>
                                    <span className={`text-[10px] font-black uppercase ${selectedReg?.is_member ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {selectedReg?.is_member ? `Member (${selectedReg.member_id})` : 'Guest'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Registered</span>
                                    <span className="text-[10px] font-bold text-slate-600">{new Date(selectedReg?.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                {isEditingReg ? (
                                    <>
                                        <Button 
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                handleSaveRegistration();
                                            }}
                                            disabled={isProcessingEdit}
                                            className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all z-50">
                                            {isProcessingEdit ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2 pointer-events-none" />} Save Changes
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                setIsEditingReg(false);
                                                setEditRegData({});
                                            }}
                                            className="w-full h-14 rounded-2xl text-slate-500 hover:text-slate-600 hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest z-50">
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button 
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                setIsEditingReg(true);
                                                setEditRegData({
                                                    primary_guest_name: selectedReg?.primary_guest_name,
                                                    email: selectedReg?.email,
                                                    primary_guest_ph: selectedReg?.primary_guest_ph,
                                                    veg_count: selectedReg?.veg_count,
                                                    non_veg_count: selectedReg?.non_veg_count,
                                                    address_street: selectedReg?.address_street,
                                                    address_city: selectedReg?.address_city,
                                                    address_state: selectedReg?.address_state,
                                                    address_zip: selectedReg?.address_zip,
                                                    selected_plans: selectedReg?.selected_plans ? JSON.parse(JSON.stringify(selectedReg.selected_plans)) : [],
                                                });
                                            }}
                                            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all z-50">
                                            <Edit3 size={16} className="mr-2 pointer-events-none" /> Edit Record
                                        </Button>
                                        <Button onClick={handleDeleteRegistration} disabled={isProcessingDelete} variant="ghost" className="w-full h-14 rounded-2xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black uppercase text-[10px] tracking-widest">
                                            <Trash2 size={16} className="mr-2" /> Delete Transaction
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
