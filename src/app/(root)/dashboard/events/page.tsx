"use client";

import React, { useEffect, useState } from "react";
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
} from "@/store/features/event-feature";

// --- ERD-ALIGNED TYPES ---

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
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

	const { data, isLoading: isOrganizationLoading } = useGetorganizationsQuery({
		limit: 1000,
	});
	const org_data = data?.data;

	const { data: rateData, isLoading: isRateLoading } = useGetratesQuery({
		limit: 1000,
	});
	const rate_data = rateData?.data;

	const { data: eventData, isLoading: isEventLoading } = useGeteventsQuery({
		limit: 1000,
	});
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
											events.find((e) => e.event_id === selectedEventId)
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
							registrations={registrations.filter(
								(r) => r.event_id === selectedEventId,
							)}
							rates={rates}
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
function OrganizationModule({
	data,
	onUpdate,
}: {
	data: any[];
	onUpdate?: (data: any[]) => void;
}) {
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editForm, setEditForm] = useState({ org_name: "", org_type: "" });

	// API Hooks
	const [createOrg, { isLoading: isCreating }] = useAddorganizationsMutation();
	const [updateOrg, { isLoading: isUpdating }] = useEditorganizationsMutation();
	const [deleteOrg, { isLoading: isDeleting }] =
		useDeleteorganizationMutation();

	const handleCreate = async () => {
		try {
			const newOrg = {
				org_name: "New Organization",
				org_type: "Educational",
			};
			toast.promise(createOrg(newOrg).unwrap(), {
				loading: "Creating organization...",
				success: "Organization created successfully",
				error: "Failed to create organization",
			});
		} catch (error) {
			toast.error("Failed to create organization");
			console.error(error);
		}
	};

	const handleStartEdit = (org: any) => {
		setEditingId(org.org_id);
		setEditForm({ org_name: org.org_name, org_type: org.org_type });
	};

	const handleSaveEdit = async (id: string) => {
		toast.promise(updateOrg({ org_id: id, data: editForm }).unwrap(), {
			loading: "Updating organization...",
			success: () => {
				setEditingId(null);
				return "Organization updated successfully";
			},
			error: "Failed to update organization",
		});
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this organization?")) {
			toast.promise(deleteOrg(id).unwrap(), {
				loading: "Deleting organization...",
				success: "Organization deleted successfully",
				error: (err) => err?.data?.message || "Failed to delete organization",
			});
		}
	};

	return (
		<Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
			<CardHeader className="p-6 md:p-8 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<CardTitle className="text-xl md:text-2xl font-black">
						Organization Master
					</CardTitle>
					<CardDescription>Manage your institutional entities</CardDescription>
				</div>
				<Button
					onClick={handleCreate}
					disabled={isCreating}
					className="w-full sm:w-auto rounded-xl bg-indigo-600 h-10 md:h-12 px-6">
					{isCreating ? (
						<Loader2
							className="mr-2 animate-spin"
							size={18}
						/>
					) : (
						<Plus
							className="mr-2"
							size={18}
						/>
					)}
					New Entry
				</Button>
			</CardHeader>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-slate-50">
						<TableRow>
							<TableHead className="px-4 md:px-8 font-bold">ID</TableHead>
							<TableHead className="font-bold">Name</TableHead>
							<TableHead className="font-bold">Type</TableHead>
							<TableHead className="text-right px-4 md:px-8 font-bold">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>

					{data.length === 0 && (
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={4}
									className="h-32 text-center text-slate-400 font-bold italic">
									No organizations available.
								</TableCell>
							</TableRow>
						</TableBody>
					)}
					<TableBody>
						{data.map((org) => (
							<TableRow key={org.org_id}>
								<TableCell className="px-4 md:px-8 font-mono font-bold text-indigo-600 text-xs">
									#{org.org_id}
								</TableCell>
								<TableCell>
									{editingId === org.org_id ? (
										<Input
											value={editForm.org_name}
											onChange={(e) =>
												setEditForm({ ...editForm, org_name: e.target.value })
											}
											className="h-8"
										/>
									) : (
										<span className="font-semibold text-sm">
											{org.org_name}
										</span>
									)}
								</TableCell>
								<TableCell>
									{editingId === org.org_id ? (
										<Select
											value={editForm.org_type}
											onValueChange={(v) =>
												setEditForm({ ...editForm, org_type: v })
											}>
											<SelectTrigger className="h-8">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Educational">Educational</SelectItem>
												<SelectItem value="Corporate">Corporate</SelectItem>
												<SelectItem value="NGO">NGO</SelectItem>
											</SelectContent>
										</Select>
									) : (
										<Badge
											variant="secondary"
											className="text-[10px]">
											{org.org_type}
										</Badge>
									)}
								</TableCell>
								<TableCell className="text-right px-4 md:px-8">
									<div className="flex justify-end gap-1">
										{editingId === org.org_id ? (
											<Button
												variant="ghost"
												disabled={isUpdating}
												size="sm"
												onClick={() => handleSaveEdit(org.org_id)}>
												<Save
													size={16}
													className={
														isUpdating
															? "animate-pulse text-slate-400"
															: "text-emerald-600"
													}
												/>
											</Button>
										) : (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleStartEdit(org)}>
												<Edit3 size={16} />
											</Button>
										)}
										<Button
											variant="ghost"
											disabled={isDeleting}
											size="sm"
											onClick={() => handleDelete(org.org_id)}
											className="text-red-400">
											<Trash2 size={16} />
										</Button>
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
function EventModule({ data, orgs, onUpdate, onSelectEvent }: any) {
	const [editId, setEditId] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const [localEvents, setLocalEvents] = useState<any[]>([]);

	useEffect(() => {
		if (data) setLocalEvents(data);
	}, [data]);

	const [addEvent] = useAddeventsMutation();
	const [editEvent] = useEditeventsMutation();
	const [deleteEvent] = useDeleteeventsMutation();

	// --- 1. CREATE PART ---
	const handleAddNewEvent = () => {
		const tempId = String(Date.now());
		const newEvent = {
			event_id: tempId,
			org_id: orgs[0]?.org_id || "",
			event_name: "New Festival/Event",
			event_date: new Date().toISOString().split("T")[0],
			event_alt_date: "",
			address_ln1: "",
			address_ln2: "",
			city: "",
			state: "",
			zip: "",
			active_flag: "Y",
		};

		setLocalEvents([newEvent, ...localEvents]);
		setEditId(tempId);
	};

	const handleSave = async (id: string) => {
		const targetEvent = localEvents.find((e) => e.event_id === id);
		if (!targetEvent) return;

		setIsProcessing(true);
		try {
			if (Number(id) > 1700000000000) {
				const { event_id, ...payload } = targetEvent;
				await toast.promise(addEvent(payload).unwrap(), {
					loading: "Creating event...",
					success: "Event created successfully!",
					error: "Failed to create event",
				});
			} else {
				await toast.promise(
					editEvent({ event_id: id, data: targetEvent }).unwrap(),
					{
						loading: "Updating event...",
						success: "Changes saved!",
						error: "Failed to update",
					},
				);
			}
			setEditId(null);
		} catch (error) {
			console.error(error);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (Number(id) > 1700000000000) {
			setLocalEvents(localEvents.filter((e) => e.event_id !== id));
			setEditId(null);
			return;
		}

		if (confirm("Are you sure you want to delete this event?")) {
			await toast.promise(deleteEvent(id).unwrap(), {
				loading: "Deleting...",
				success: "Event deleted",
				error: "Error deleting event",
			});
		}
	};

	const updateLocalField = (id: string, field: string, value: any) => {
		setLocalEvents((prev) =>
			prev.map((evt) =>
				evt.event_id === id ? { ...evt, [field]: value } : evt,
			),
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-black uppercase tracking-tight text-slate-400">
					Events List
				</h2>
				<Button
					onClick={handleAddNewEvent}
					disabled={isProcessing || !!editId}
					className="rounded-xl bg-indigo-600 shadow-lg hover:bg-indigo-700">
					<Plus
						className="mr-2"
						size={18}
					/>
					Add Event
				</Button>
			</div>

			{localEvents.length === 0 && (
				<div className="flex flex-col items-center justify-center h-64 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
					<CalendarDays
						size={48}
						className="mb-4 opacity-20"
					/>
					<p className="font-bold italic">
						No events found. Create your first event to get started.
					</p>
				</div>
			)}

			{localEvents.map((evt: any) => (
				<Card
					key={evt.event_id}
					className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-xl bg-white p-6 md:p-10 space-y-6 overflow-hidden ring-1 ring-slate-100">
					<div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-6">
						<div className="space-y-4 w-full max-w-xl">
							<div className="flex items-center gap-3">
								<Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1">
									<Building2
										size={12}
										className="mr-2"
									/>
									{orgs.find((o: any) => o.org_id === evt.org_id)?.org_name ||
										"Unlinked Org"}
								</Badge>

								<div onClick={(e) => e.stopPropagation()}>
									<Select
										disabled={editId !== evt.event_id}
										value={evt.org_id?.toString()}
										onValueChange={(v) =>
											updateLocalField(evt.event_id, "org_id", v)
										}>
										<SelectTrigger className="h-8 rounded-lg bg-slate-50 border-none font-bold text-[10px] w-48 shadow-sm">
											<SelectValue placeholder="Change Organization" />
										</SelectTrigger>
										<SelectContent>
											{orgs.map((o: any) => (
												<SelectItem
													key={o.org_id}
													value={o.org_id.toString()}>
													{o.org_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div
								className="group cursor-pointer"
								onClick={() =>
									editId !== evt.event_id && onSelectEvent(evt.event_id)
								}>
								{editId === evt.event_id ? (
									<Input
										className="text-lg md:text-2xl font-black h-12"
										value={evt.event_name}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) =>
											updateLocalField(
												evt.event_id,
												"event_name",
												e.target.value,
											)
										}
									/>
								) : (
									<h3 className="text-lg md:text-3xl font-black text-[#171e41] group-hover:text-indigo-600 transition-all flex items-center gap-2">
										{evt.event_name}
										<ArrowLeft
											className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600"
											size={20}
										/>
									</h3>
								)}
							</div>
						</div>

						<div className="flex gap-2 w-full md:w-auto">
							<Button
								variant={editId === evt.event_id ? "default" : "outline"}
								className="flex-1 md:flex-none rounded-xl h-12 px-8 font-bold shadow-sm"
								onClick={(e) => {
									e.stopPropagation();
									if (editId === evt.event_id) {
										handleSave(evt.event_id);
									} else {
										setEditId(evt.event_id);
									}
								}}>
								{editId === evt.event_id ? (
									<Save
										size={18}
										className="mr-2"
									/>
								) : (
									<Edit3
										size={18}
										className="mr-2"
									/>
								)}
								{editId === evt.event_id ? "Save Changes" : "Manage Event"}
							</Button>
							<Button
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									handleDelete(evt.event_id);
								}}
								className="text-red-400 hover:text-red-600 hover:bg-red-50 h-12 w-12 rounded-xl">
								<Trash2 size={20} />
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="space-y-4 md:col-span-2">
							<div className="flex items-center gap-2 text-slate-400">
								<MapPinned size={14} />
								<Label className="text-[10px] uppercase font-black tracking-widest">
									Venue Logistics
								</Label>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
										Address Line 1
									</Label>
									<Input
										placeholder="Address Line 1"
										disabled={editId !== evt.event_id}
										value={evt.address_ln1}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) =>
											updateLocalField(
												evt.event_id,
												"address_ln1",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
										Address Line 2
									</Label>
									<Input
										placeholder="Address Line 2"
										disabled={editId !== evt.event_id}
										value={evt.address_ln2}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) =>
											updateLocalField(
												evt.event_id,
												"address_ln2",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
									<div className="space-y-1">
										<Label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
											City
										</Label>
										<Input
											placeholder="City"
											disabled={editId !== evt.event_id}
											value={evt.city}
											onClick={(e) => e.stopPropagation()}
											onChange={(e) =>
												updateLocalField(evt.event_id, "city", e.target.value)
											}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
											State
										</Label>
										<Input
											placeholder="State"
											disabled={editId !== evt.event_id}
											value={evt.state}
											onClick={(e) => e.stopPropagation()}
											onChange={(e) =>
												updateLocalField(evt.event_id, "state", e.target.value)
											}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-[9px] font-bold text-slate-400 uppercase ml-1">
											Zip
										</Label>
										<Input
											placeholder="Zip"
											disabled={editId !== evt.event_id}
											value={evt.zip}
											onClick={(e) => e.stopPropagation()}
											onChange={(e) =>
												updateLocalField(evt.event_id, "zip", e.target.value)
											}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4 bg-slate-50 p-4 rounded-2xl ring-1 ring-slate-200/50">
							<div className="flex items-center gap-2 text-indigo-500">
								<CalendarClock size={14} />
								<Label className="text-[10px] uppercase font-black tracking-widest">
									Timeline
								</Label>
							</div>
							<div className="space-y-3">
								<div onClick={(e) => e.stopPropagation()}>
									<span className="text-[9px] font-bold text-slate-400 uppercase ml-1">
										Primary Date
									</span>
									<Input
										type="date"
										className="bg-white"
										disabled={editId !== evt.event_id}
										value={evt.event_date}
										onChange={(e) =>
											updateLocalField(
												evt.event_id,
												"event_date",
												e.target.value,
											)
										}
									/>
								</div>
								<div onClick={(e) => e.stopPropagation()}>
									<span className="text-[9px] font-bold text-slate-400 uppercase ml-1">
										Alt Date
									</span>
									<Input
										type="date"
										className="bg-white"
										disabled={editId !== evt.event_id}
										value={evt.event_alt_date}
										onChange={(e) =>
											updateLocalField(
												evt.event_id,
												"event_alt_date",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="flex items-center justify-between gap-3 pt-2">
									<Label className="text-[10px] font-bold text-slate-500 uppercase">
										Status:
									</Label>
									<Badge
										onClick={(e) => {
											e.stopPropagation();
											if (editId === evt.event_id) {
												updateLocalField(
													evt.event_id,
													"active_flag",
													evt.active_flag === "Y" ? "N" : "Y",
												);
											}
										}}
										className={`${evt.active_flag === "Y" ? "bg-emerald-500" : "bg-slate-300"} cursor-pointer`}>
										{evt.active_flag === "Y" ? "Active" : "Inactive"}
									</Badge>
								</div>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
// --- Types based on your new schema ---
interface RatePlan {
	rate_plan_id?: string;
	rate_plan_name: string;
	rate_plan_code: string;
	effective_date: string;
	end_date: string;
	adult_count: number;
	child_count: number;
	adult_amount: number;
	child_amount: number;
	created_at?: string;
}

export function RateModule({ data, events, onUpdate }: any) {
	const [editId, setEditId] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// 1. Add local state to allow immediate UI updates before backend save
	const [localRates, setLocalRates] = useState<any[]>([]);

	// 2. Keep local state in sync with RTK Query data
	useEffect(() => {
		if (data) setLocalRates(data);
	}, [data]);

	const [addRates, { error: addRateError, isError: addRateIsError }] =
		useAddratesMutation();
	const [updateRate] = useEditratesMutation();
	const [deleteRate] = useDeleteratesMutation();

	// --- 1. CREATE PART ---
	const handleCreate = () => {
		const tempId = `temp-${Math.random().toString(36).substring(2, 9)}`;
		const newRate: RatePlan = {
			rate_plan_id: tempId,
			rate_plan_name: "New Plan",
			rate_plan_code: "NEW",
			effective_date: new Date().toISOString().split("T")[0],
			end_date: new Date().toISOString().split("T")[0],
			adult_count: 1,
			child_count: 0,
			adult_amount: 0,
			child_amount: 0,
		};

		// Update local state so it appears immediately
		setLocalRates([newRate, ...localRates]);
		setEditId(tempId);
	};

	// Helper to update specific fields in local state while typing
	const updateLocalField = (id: string, field: string, value: any) => {
		setLocalRates((prev) =>
			prev.map((r) => (r.rate_plan_id === id ? { ...r, [field]: value } : r)),
		);
	};

	// --- 2. UPDATE PART ---
	const handleSave = async (id: string, currentData: any) => {
		setIsProcessing(true);
		try {
			if (id.startsWith("temp-")) {
				const { rate_plan_id, ...payload } = currentData;
				await toast.promise(addRates(payload).unwrap(), {
					loading: "Creating rate plan...",
					success: "Rate plan created successfully",
					error: "Failed to create rate plan",
				});
			} else {
				await toast.promise(
					updateRate({ rate_plan_id: id, data: currentData }).unwrap(),
					{
						loading: "Updating rate plan...",
						success: () => {
							setEditId(null);
							return "Rate plan updated successfully";
						},
						error: "Failed to update rate plan",
					},
				);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsProcessing(false);
		}
	};

	// --- 3. DELETE PART ---
	const handleDelete = async (id: string) => {
		if (id.startsWith("temp-")) {
			setLocalRates(localRates.filter((r) => r.rate_plan_id !== id));
			setEditId(null);
			return;
		}

		if (confirm("Delete this rate plan? This cannot be undone.")) {
			setIsProcessing(true);
			try {
				await toast.promise(deleteRate(id).unwrap(), {
					loading: "Removing rate plan...",
					success: "Rate plan removed",
					error: (err) => err?.data?.message || "Failed to delete rate plan",
				});
			} catch (error: any) {
				console.error(error);
			} finally {
				setIsProcessing(false);
			}
		}
	};

	useEffect(() => {
		if (addRateIsError) {
			toast.error((addRateError as any).data.message);
		}
	}, [addRateError, addRateIsError]);

	return (
		<Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
			<CardHeader className="p-8 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<CardTitle className="text-xl md:text-2xl font-black">
						Rate Plan Master
					</CardTitle>
					<CardDescription>
						Define pricing tiers for your event registrations
					</CardDescription>
				</div>
				<Button
					onClick={handleCreate}
					disabled={isProcessing}
					className="rounded-xl bg-indigo-600 h-12 px-6 shadow-lg hover:bg-indigo-700 transition-all">
					{isProcessing ? (
						<Loader2
							className="animate-spin mr-2"
							size={18}
						/>
					) : (
						<Plus
							size={18}
							className="mr-2"
						/>
					)}
					Define New Rate
				</Button>
			</CardHeader>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-slate-50">
						<TableRow>
							<TableHead className="font-bold text-[10px] uppercase text-slate-400">
								Plan Details
							</TableHead>
							<TableHead className="font-bold text-[10px] uppercase text-slate-400">
								Validity
							</TableHead>
							<TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">
								Adult Tier
							</TableHead>
							<TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">
								Child Tier
							</TableHead>
							<TableHead className="text-right px-6 font-bold text-[10px] uppercase text-slate-400">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					{localRates.length === 0 && (
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-64 text-center text-slate-400 font-bold italic">
									No rate plans available.
								</TableCell>
							</TableRow>
						</TableBody>
					)}
					<TableBody>
						{localRates.map((rp: any) => (
							<TableRow
								key={rp.rate_plan_id}
								className="hover:bg-slate-50/50 transition-colors group">
								<TableCell>
									{editId === rp.rate_plan_id ? (
										<div className="space-y-1">
											<Input
												className="h-8 text-xs font-bold"
												value={rp.rate_plan_name}
												onChange={(e) =>
													updateLocalField(
														rp.rate_plan_id,
														"rate_plan_name",
														e.target.value,
													)
												}
											/>
											<Input
												className="h-7 text-[10px] font-mono uppercase"
												placeholder="CODE"
												value={rp.rate_plan_code}
												onChange={(e) =>
													updateLocalField(
														rp.rate_plan_id,
														"rate_plan_code",
														e.target.value,
													)
												}
											/>
										</div>
									) : (
										<div className="space-y-1">
											<p className="font-black text-slate-900 leading-tight">
												{rp.rate_plan_name}
											</p>
											<Badge
												variant="outline"
												className="text-[9px] font-mono py-0">
												{rp.rate_plan_code}
											</Badge>
										</div>
									)}
								</TableCell>

								<TableCell>
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-1">
											<span className="text-[9px] text-slate-400 font-bold w-6">
												EFF
											</span>
											{editId === rp.rate_plan_id ? (
												<Input
													type="date"
													className="h-7 text-[10px] w-28"
													value={rp.effective_date}
													onChange={(e) =>
														updateLocalField(
															rp.rate_plan_id,
															"effective_date",
															e.target.value,
														)
													}
												/>
											) : (
												<span className="text-[11px] font-mono font-bold">
													{rp.effective_date || "---"}
												</span>
											)}
										</div>
										<div className="flex items-center gap-1">
											<span className="text-[9px] text-rose-400 font-bold w-6">
												END
											</span>
											{editId === rp.rate_plan_id ? (
												<Input
													type="date"
													className="h-7 text-[10px] w-28"
													value={rp.end_date}
													onChange={(e) =>
														updateLocalField(
															rp.rate_plan_id,
															"end_date",
															e.target.value,
														)
													}
												/>
											) : (
												<span className="text-[11px] font-mono text-slate-400">
													{rp.end_date || "Open"}
												</span>
											)}
										</div>
									</div>
								</TableCell>

								<TableCell className="text-center">
									<div className="flex flex-col items-center">
										<span className="text-[9px] text-slate-400 font-bold">
											QTY / AMT
										</span>
										{editId === rp.rate_plan_id ? (
											<div className="flex gap-1 mt-1">
												<Input
													type="number"
													className="h-7 w-12 text-center text-xs"
													value={rp.adult_count}
													onChange={(e) =>
														updateLocalField(
															rp.rate_plan_id,
															"adult_count",
															parseInt(e.target.value),
														)
													}
												/>
												<Input
													type="number"
													className="h-7 w-16 text-center text-xs"
													value={rp.adult_amount}
													onChange={(e) =>
														updateLocalField(
															rp.rate_plan_id,
															"adult_amount",
															parseFloat(e.target.value),
														)
													}
												/>
											</div>
										) : (
											<div className="flex items-baseline gap-1 mt-1">
												<span className="text-xs font-bold">
													{rp.adult_count}x
												</span>
												<span className="text-sm font-black text-indigo-600">
													${rp.adult_amount.toFixed(2)}
												</span>
											</div>
										)}
									</div>
								</TableCell>

								<TableCell className="text-center">
									<div className="flex flex-col items-center">
										<span className="text-[9px] text-slate-400 font-bold">
											QTY / AMT
										</span>
										{editId === rp.rate_plan_id ? (
											<div className="flex gap-1 mt-1">
												<Input
													type="number"
													className="h-7 w-12 text-center text-xs"
													value={rp.child_count}
													onChange={(e) =>
														updateLocalField(
															rp.rate_plan_id,
															"child_count",
															parseInt(e.target.value),
														)
													}
												/>
												<Input
													type="number"
													className="h-7 w-16 text-center text-xs"
													value={rp.child_amount}
													onChange={(e) =>
														updateLocalField(
															rp.rate_plan_id,
															"child_amount",
															parseFloat(e.target.value),
														)
													}
												/>
											</div>
										) : (
											<div className="flex items-baseline gap-1 mt-1">
												<span className="text-xs font-bold">
													{rp.child_count}x
												</span>
												<span className="text-sm font-black text-emerald-600">
													${rp.child_amount.toFixed(2)}
												</span>
											</div>
										)}
									</div>
								</TableCell>

								<TableCell className="text-right px-6">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												editId === rp.rate_plan_id
													? handleSave(rp.rate_plan_id, rp)
													: setEditId(rp.rate_plan_id)
											}>
											{editId === rp.rate_plan_id ? (
												<Save
													size={16}
													className="text-indigo-600"
												/>
											) : (
												<Edit3 size={16} />
											)}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(rp.rate_plan_id)}
											className="text-red-400 hover:text-red-600 hover:bg-red-50">
											<Trash2 size={16} />
										</Button>
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

// --- NEW PARTICIPANTS (REGISTRATION) MODULE ---
function RegistrationModule({
	registrations,
	rates,
}: {
	registrations: EventRegistration[];
	rates: RatePlanMaster[];
}) {
	return (
		<Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-slate-50">
						<TableRow>
							<TableHead className="px-6 py-4 font-black text-[10px] uppercase text-slate-400 tracking-widest">
								Guest Information
							</TableHead>
							<TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest">
								Reference
							</TableHead>
							<TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest">
								Attendance
							</TableHead>
							<TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-widest text-right px-6">
								Payment
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{registrations.map((reg) => (
							<TableRow
								key={reg.event_registration_num}
								className="hover:bg-slate-50/50 transition-colors align-top border-slate-100">
								<TableCell className="px-6 py-6 min-w-[250px]">
									<div className="space-y-3">
										<p className="font-black text-xl text-slate-900 leading-tight">
											{reg.primary_guest_name}
										</p>
										<div className="flex flex-col gap-1 text-xs font-bold text-slate-500">
											<span className="flex items-center gap-2">
												<Mail
													size={12}
													className="text-indigo-500"
												/>{" "}
												{reg.primary_guest_email}
											</span>
											<span className="flex items-center gap-2">
												<Phone
													size={12}
													className="text-indigo-500"
												/>{" "}
												{reg.primary_guest_ph}
											</span>
										</div>
									</div>
								</TableCell>
								<TableCell className="py-6">
									<div className="space-y-2">
										<Badge className="bg-slate-800 text-white border-none rounded-lg text-[10px] font-black uppercase tracking-tighter">
											{
												rates.find((r) => r.rate_plan_id === reg.rate_plan_id)
													?.rate_plan_nm
											}
										</Badge>
										<div className="flex flex-col text-[10px] text-slate-400 font-mono gap-0.5">
											<span># {reg.event_registration_num}</span>
											<span>MEM ID: {reg.member_id}</span>
											<span>{reg.event_registration_date}</span>
										</div>
									</div>
								</TableCell>
								<TableCell className="py-6 min-w-[150px]">
									<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-l pl-4 border-slate-100">
										<div className="flex flex-col">
											<span className="text-[9px] font-black text-slate-300 uppercase">
												Adult
											</span>
											<span className="text-sm font-black">
												{reg.adult_count}
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-[9px] font-black text-slate-300 uppercase">
												Child
											</span>
											<span className="text-sm font-black">
												{reg.child_count}
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-[9px] font-black text-slate-300 uppercase">
												Student
											</span>
											<span className="text-sm font-black">
												{reg.student_count}
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-[9px] font-black text-slate-300 uppercase">
												Senior
											</span>
											<span className="text-sm font-black">
												{reg.senior_count}
											</span>
										</div>
									</div>
								</TableCell>
								<TableCell className="text-right px-6 py-6">
									<div className="space-y-2">
										<div className="text-2xl font-black text-emerald-600 flex items-center justify-end gap-1">
											<span className="text-sm opacity-50 font-bold">$</span>
											{reg.total_amount.toFixed(2)}
										</div>
										{reg.additional_donation > 0 && (
											<div className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full ring-1 ring-rose-100 uppercase tracking-tighter">
												<Heart
													size={10}
													fill="currentColor"
												/>{" "}
												Donation: {reg.additional_donation.toFixed(2)}
											</div>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{registrations.length === 0 && (
					<div className="p-20 text-center text-slate-300 font-bold italic">
						No participant records found for this event.
					</div>
				)}
			</div>
		</Card>
	);
}
