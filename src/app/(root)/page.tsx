/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
	useAddMembersMutation,
	useDeleteMemberMutation,
	useEditMembersMutation,
	useGetMembersQuery,
} from "@/store/features/members";
import { format, isValid, parse, set } from "date-fns";
import Image from "next/image";
import {
	CalendarIcon,
	Search,
	X,
	Download,
	Plus,
	Mail,
	Edit,
	Trash,
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	DollarSign,
	MessageCircle,
	UserPlus,
	Loader2,
	Send,
	MapPin,
	Hash,
	Upload, // Added Upload Icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
	useGetTemplatesQuery,
	useSendEmailMutation,
} from "@/store/features/email-template";
import Papa from "papaparse"; // Optional: Ideally import this, but code below has fallback

import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const US_STATES = [
	"AL",
	"AK",
	"AZ",
	"AR",
	"CA",
	"CO",
	"CT",
	"DE",
	"FL",
	"GA",
	"HI",
	"ID",
	"IL",
	"IN",
	"IA",
	"KS",
	"KY",
	"LA",
	"ME",
	"MD",
	"MA",
	"MI",
	"MN",
	"MS",
	"MO",
	"MT",
	"NE",
	"NV",
	"NH",
	"NJ",
	"NM",
	"NY",
	"NC",
	"ND",
	"OH",
	"OK",
	"OR",
	"PA",
	"RI",
	"SC",
	"SD",
	"TN",
	"TX",
	"UT",
	"VT",
	"VA",
	"WA",
	"WV",
	"WI",
	"WY",
	"WB",
];

interface MemberInput {
	UUID: string;
	MemberId: string;
	FamilyId: string;
	Name: string;
	EmailAddress: string;
	PhoneNo: string;
	Gender: string;
	DOB: Date | undefined;
	Activity: string;
	Status: string;
	City: string;
	State: string;
	Street: string;
	Zip: string;
	WhatsappGroupMember: boolean;
	SendEmail: boolean;
	Amount: string;
	ForYear: string;
	TransactionDate: Date | undefined;
	DepositDate: Date | undefined;
	Comments: string;
	isPrimary?: boolean;
	profileImage?: File | string | null;
}

const ParticipantsPage = () => {
	// --- DATA & FILTERING ---
	const [searchQuery, setSearchQuery] = useState("");
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [filterStatus, setFilterStatus] = useState("all");

	// --- PAGINATION STATE (TOKEN STACK) ---
	const [currentPage, setCurrentPage] = useState(1);
	const [currentKey, setCurrentKey] = useState<string | null>(null);
	const [keyHistory, setKeyHistory] = useState<string[]>([]);

	// --- QUERY ---
	const {
		data: members,
		refetch: memberRefetch,
		isLoading,
	} = useGetMembersQuery({
		page: currentPage,
		search: searchQuery,
		limit: itemsPerPage,
		status: filterStatus === "all" ? undefined : filterStatus,
		lastKey: currentKey || undefined,
	});
	// Fetch all Members
	const { data: allMembers } = useGetMembersQuery({
		page: currentPage,
		search: searchQuery,
		limit: members?.totalMembers,
		status: filterStatus === "all" ? undefined : filterStatus,
		lastKey: currentKey || undefined,
	});

	const rawParticipants = members?.members || [];
	const nextKeyFromApi = members?.lastKey;

	// --- RESET PAGINATION ON FILTER CHANGE ---
	useEffect(() => {
		setCurrentPage(1);
		setCurrentKey(null);
		setKeyHistory([]);
	}, [filterStatus, searchQuery]);

	// --- PAGINATION HANDLERS ---
	const handleNextPage = () => {
		if (nextKeyFromApi) {
			setKeyHistory((prev) => [...prev, currentKey as string]);
			setCurrentKey(nextKeyFromApi);
			setCurrentPage((prev) => prev + 1);
		}
	};

	const handlePreviousPage = () => {
		if (keyHistory.length > 0) {
			const prevKey = keyHistory[keyHistory.length - 1];
			setCurrentKey(prevKey || null);
			setKeyHistory((prev) => prev.slice(0, -1));
			setCurrentPage((prev) => Math.max(1, prev - 1));
		}
	};

	// --- UI STATE ---
	const [isOpen, setIsOpen] = useState(false);
	const [isBulkEmailDialogOpen, setIsBulkEmailDialogOpen] = useState(false);
	const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
	const [isLoopingCreation, setIsLoopingCreation] = useState(false);
	const [isImporting, setIsImporting] = useState(false); // Import State

	// --- FORM STATE ---
	const [hasFamily, setHasFamily] = useState(false);
	const [isEditingPrimary, setIsEditingPrimary] = useState(true);

	// Ref for file input
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Initial State
	const initialFormState: MemberInput & { familyMembers: MemberInput[] } = {
		UUID: "",
		MemberId: "",
		FamilyId: "",
		Name: "",
		EmailAddress: "",
		PhoneNo: "",
		Gender: "Male",
		DOB: undefined,
		Activity: "",
		Status: "Active",
		City: "",
		State: "",
		Street: "",
		Zip: "",
		WhatsappGroupMember: false,
		SendEmail: false,
		Amount: "",
		ForYear: "",
		TransactionDate: undefined,
		DepositDate: undefined,
		Comments: "",
		isPrimary: true,
		profileImage: null,
		familyMembers: [],
	};

	const [editForm, setEditForm] = useState(initialFormState);

	// --- HANDLERS ---
	const addFamilyMemberRow = () => {
		setEditForm((prev) => ({
			...prev,
			familyMembers: [
				...prev.familyMembers,
				{
					...initialFormState,
					UUID: "",
					Name: "",
					isPrimary: false,
					City: prev.City,
					State: prev.State,
					Street: prev.Street,
					Zip: prev.Zip,
					FamilyId: prev.FamilyId || prev.UUID,
					Amount: "N/A",
					Comments: "",
					Status: "Active",
					Activity: "",
				},
			],
		}));
	};

	const removeFamilyMemberRow = (index: number) => {
		setEditForm((prev) => ({
			...prev,
			familyMembers: prev.familyMembers.filter((_, i) => i !== index),
		}));
	};

	const updateFamilyMember = (
		index: number,
		field: keyof MemberInput,
		value: any,
	) => {
		const updatedMembers = [...editForm.familyMembers];
		updatedMembers[index] = { ...updatedMembers[index], [field]: value };
		setEditForm((prev) => ({ ...prev, familyMembers: updatedMembers }));
	};

	const handleSelectUser = (userId: string, checked: boolean) => {
		if (checked) {
			setSelectedUsers((prev) => [...prev, userId]);
		} else {
			setSelectedUsers((prev) => prev.filter((id) => id !== userId));
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedUsers(
				rawParticipants.map((p: any) => p.UUID?.toString() || p.id?.toString()),
			);
		} else {
			setSelectedUsers([]);
		}
	};

	const isAllSelected =
		selectedUsers.length === rawParticipants.length &&
		rawParticipants.length > 0;

	const handleViewParticipant = (participant: any) => {
		setSelectedParticipant(participant);
		setIsViewDialogOpen(true);
	};

	// Helper to map DB response to Form State
	const mapParticipantToForm = (p: any): MemberInput => ({
		UUID: p.UUID || p.id,
		MemberId: p.MemberId || "",
		FamilyId: p.FamilyId || "",
		Name: p.Name || (p.firstName ? `${p.firstName} ${p.lastName}` : ""),
		EmailAddress: p.EmailAddress || p.email || "",
		PhoneNo: p.PhoneNo || p.phone || "",
		Gender: p.Gender || "M",
		DOB: p.DOB ? new Date(p.DOB) : undefined,
		Activity: p.Activity || "",
		Status: p.Status || p.status || "Active",
		City: p.City || "",
		State: p.State || "",
		Street: p.Street || "",
		Zip: p.Zip || p.zipCode || "",
		WhatsappGroupMember: p.WhatsappGroupMember || false,
		SendEmail: p.SendEmail || false,
		Amount: p.Amount ? String(p.Amount) : "",
		ForYear: p.ForYear || "",
		TransactionDate: p.TransactionDate
			? new Date(p.TransactionDate)
			: new Date(),
		DepositDate: p.DepositDate ? new Date(p.DepositDate) : undefined,
		Comments: p.Comments || "",
		isPrimary: p.isPrimary,
		profileImage: p.profileImage || null,
	});

	const handleEditParticipant = (participant: any) => {
		setIsEditDialogOpen(true);
		const isPrimary = participant.isPrimary;
		setIsEditingPrimary(isPrimary);

		const existingFamily = isPrimary
			? participant.family?.members?.filter((m: any) => !m.isPrimary) || []
			: [];

		setHasFamily(existingFamily.length > 0);

		setEditForm({
			...mapParticipantToForm(participant),
			familyMembers: existingFamily.map(mapParticipantToForm),
		});
	};

	const handleAddFamilyMemberAction = (participant: any) => {
		setIsEditDialogOpen(true);
		setIsEditingPrimary(true);

		const existingFamily =
			participant.family?.members?.filter((m: any) => !m.isPrimary) || [];
		const baseForm = mapParticipantToForm(participant);

		const newBlankMember: MemberInput = {
			...initialFormState,
			UUID: "",
			Name: "",
			isPrimary: false,
			City: baseForm.City,
			State: baseForm.State,
			Street: baseForm.Street,
			Zip: baseForm.Zip,
			FamilyId: baseForm.FamilyId || baseForm.UUID,
			Amount: "N/A",
			Comments: "",
			Status: "Active",
			Activity: "",
		};

		setHasFamily(true);

		setEditForm({
			...baseForm,
			familyMembers: [
				...existingFamily.map(mapParticipantToForm),
				newBlankMember,
			],
		});
	};

	const handleResetForm = () => {
		setHasFamily(false);
		setIsEditingPrimary(true);
		setEditForm(initialFormState);
	};

	const [deleteMember, { isLoading: isDeleteLoading }] =
		useDeleteMemberMutation();
	const handleDeleteParticipant = async (participant: any) => {
		if (confirm(`Are you sure you want to delete ${participant.Name}?`)) {
			try {
				const deletePromise = deleteMember({
					familyId: participant.FamilyId,
					memberId: participant.MemberId,
				}).unwrap();

				toast.promise(deletePromise, {
					loading: "Deleting member...",
					success: `${participant.Name} has been deleted successfully.`,
					error: "Failed to delete member",
				});

				await deletePromise;
				memberRefetch();
			} catch (error) {
				console.error(error);
			}
		}
	};

	const handleCancelEdit = () => {
		setIsEditDialogOpen(false);
		setIsOpen(false);
	};

	const [editMember, { isLoading: isEditLoading }] = useEditMembersMutation();
	const [addMembers] = useAddMembersMutation();

	const handleSaveEdit = async () => {
		setIsLoopingCreation(true);
		let successCount = 0;

		try {
			const primaryRes = await editMember({
				data: editForm,
			}).unwrap();

			if (primaryRes.success) {
				successCount++;

				if (hasFamily && editForm.familyMembers.length > 0) {
					for (const famMember of editForm.familyMembers) {
						try {
							const newFamData = {
								...famMember,
								FamilyId: editForm.FamilyId,
							};

							const res = await addMembers(newFamData).unwrap();
							if (res.success) successCount++;
						} catch (famError: any) {
							console.error("Error processing family member", famError);
							toast.error(`Failed to save data for ${famMember.Name}`);
						}
					}
				}

				toast.success(`Member updated successfully.`);
				setIsEditDialogOpen(false);
				memberRefetch();
				handleResetForm();
			}
		} catch (error) {
			console.log(error);
			toast.error("Failed to update member.");
		} finally {
			setIsLoopingCreation(false);
		}
	};

	const addParticipant = async () => {
		setIsLoopingCreation(true);
		let successCount = 0;
		try {
			const primaryRes = await addMembers(editForm).unwrap();

			if (primaryRes && primaryRes.success) {
				successCount++;
				const newFamilyId = primaryRes.FamilyId;

				if (hasFamily && editForm.familyMembers.length > 0 && newFamilyId) {
					for (const famMember of editForm.familyMembers) {
						try {
							const newFamData = {
								...famMember,
								FamilyId: newFamilyId,
							};

							const famRes = await addMembers(newFamData).unwrap();
							if (famRes.success) successCount++;
						} catch (famError: any) {
							toast.error(`Failed to add ${famMember.Name}`);
						}
					}
				}
				toast.success(`Successfully added ${successCount} member(s).`);
				setIsOpen(false);
				memberRefetch();
				handleResetForm();
			} else {
				toast.error("Failed to create primary member.");
			}
		} catch (error) {
			toast.error("An error occurred.");
		} finally {
			setIsLoopingCreation(false);
		}
	};

	// --- IMPORT CSV FUNCTIONALITY ---
	const handleImportCsv = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsImporting(true);

		const parseCSV = (csvText: string) => {
			// Basic CSV Parser fallback if papa parse isn't available
			// Splits by newline and commas, handles simple quotes
			const lines = csvText.split(/\r\n|\n/);
			const headers = lines[0]
				.split(",")
				.map((h) => h.trim().replace(/^"|"$/g, ""));
			const result = [];
			for (let i = 1; i < lines.length; i++) {
				if (!lines[i].trim()) continue;
				// Matches CSV values considering quotes
				const currentLine =
					lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) ||
					lines[i].split(",");
				if (currentLine) {
					const obj: any = {};
					headers.forEach((header, index) => {
						let val = currentLine[index] ? currentLine[index].trim() : "";
						val = val.replace(/^"|"$/g, "").replace(/""/g, '"'); // Remove quotes
						obj[header] = val;
					});
					result.push(obj);
				}
			}
			return result;
		};

		const processData = async (data: any[]) => {
			let successCount = 0;
			let failCount = 0;

			for (const row of data) {
				try {
					// Map CSV Row to MemberInput
					const mapBoolean = (val: string) =>
						["true", "yes", "1", "y"].includes(String(val).toLowerCase());
					const mapDate = (val: string) => {
						if (!val) return undefined;
						const d = new Date(val);
						return isValid(d) ? d : undefined;
					};

					const newMember: MemberInput = {
						...initialFormState,
						UUID: row["UUID"] || "",
						FamilyId: row["Family Id"] || "",
						MemberId: row["Member Id"] || "",
						Name: row["Name"] || "",
						Amount: row["Amount"] || "",
						ForYear: row["For the Year"] || new Date().getFullYear().toString(),
						TransactionDate: mapDate(row["Transaction Date"]),
						DepositDate: mapDate(row["Deposit Date"]),
						Comments: row["Comments"] || "",
						Activity: row["Activity"] || "",
						Gender: row["Gender"] || "Male",
						SendEmail: mapBoolean(row["SendEmail"]),
						EmailAddress: row["EmailAddress"] || "",
						PhoneNo: row["Phone No"] || "",
						Street: row["Street"] || "",
						City: row["City"] || "",
						State: row["State"] || "",
						Zip: row["Zip"] || "",
						DOB: mapDate(row["DOB"]),
						WhatsappGroupMember: mapBoolean(row["Whatsapp group member"]),
						Status: "Active", // Defaulting to active
						isPrimary: true, // Default import as primary unless logic dictates otherwise
					};

					// Basic validation: Name required
					if (!newMember.Name) {
						failCount++;
						continue;
					}

					const res = await addMembers(newMember).unwrap();
					if (res.success) {
						successCount++;
					} else {
						failCount++;
					}
				} catch (error) {
					console.error("Import error row:", row, error);
					failCount++;
				}
			}

			toast.success(
				`Import complete: ${successCount} added, ${failCount} failed.`,
			);
			memberRefetch();
			setIsImporting(false);
			if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
		};

		const reader = new FileReader();
		reader.onload = async (e) => {
			const text = e.target?.result as string;
			let data = [];

			// Use PapaParse if available, else manual
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (typeof Papa !== "undefined") {
				Papa.parse(text, {
					header: true,
					skipEmptyLines: true,
					complete: function (results: any) {
						processData(results.data);
					},
				});
			} else {
				data = parseCSV(text);
				processData(data);
			}
		};
		reader.readAsText(file);
	};

	const exportToCsv = () => {
		const rawParticipants = allMembers?.members || [];

		const headers = [
			"UUID",
			"Family Id",
			"Member Id",
			"Name",
			"Amount",
			"For the Year",
			"Transaction Date",
			"Deposit Date",
			"Comments",
			"Activity",
			"Gender",
			"SendEmail",
			"EmailAddress",
			"Phone No",
			"Street",
			"City",
			"State",
			"Zip",
			"DOB",
			"Whatsapp group member",
		];
		const rows = rawParticipants.map((p: any) =>
			[
				p.UUID || p.id,
				p.FamilyId,
				p.MemberId,
				p.Name || `${p.firstName} ${p.lastName}`,
				p.Amount,
				p.ForYear,
				p.TransactionDate
					? format(new Date(p.TransactionDate), "yyyy-MM-dd")
					: "",
				p.DepositDate ? format(new Date(p.DepositDate), "yyyy-MM-dd") : "",
				p.Comments,
				p.Activity,
				p.Gender,
				p.SendEmail ? "TRUE" : "FALSE",
				p.EmailAddress || p.email,
				p.PhoneNo || p.phone,
				p.Street,
				p.City,
				p.State,
				p.Zip || p.zipCode,
				p.DOB ? format(new Date(p.DOB), "yyyy-MM-dd") : "",
				p.WhatsappGroupMember ? "TRUE" : "FALSE",
			]
				.map((val) =>
					val ? (String(val).includes(",") ? `"${val}"` : val) : "",
				)
				.join(","),
		);

		const csvContent = [headers.join(","), ...rows].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `members.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setItemsPerPage(10);
	};

	// --- EMAIL ---
	const [emailSubject, setEmailSubject] = useState("");
	const [emailBody, setEmailBody] = useState("");
	const [emailTemplate, setEmailTemplate] = useState("");
	const [isSendingEmail, setIsSendingEmail] = useState(false);
	const { data: templatesData } = useGetTemplatesQuery({});
	const emailTemplates = templatesData?.data || [];
	const [sendEmail] = useSendEmailMutation();

	const handleEmailTemplateChange = (templateId: string) => {
		setEmailTemplate(templateId);
		if (templateId === "custom") {
			setEmailSubject("");
			setEmailBody("");
			return;
		}
		const selectedTemplate = emailTemplates.find(
			(t: any) => t.id === templateId,
		);
		if (selectedTemplate) {
			setEmailSubject(selectedTemplate.subject);
			setEmailBody(selectedTemplate.body);
		}
	};

	const handleSendEmail = async () => {
		const recipientIds: string[] = isBulkEmailDialogOpen
			? selectedUsers
			: selectedParticipant
				? [selectedParticipant.UUID || selectedParticipant.id]
				: [];
		console.log(recipientIds);
		if (recipientIds.length === 0) {
			toast.error("No recipients selected.");
			return;
		}
		if (!emailSubject || !emailBody) {
			toast.error("Subject and Body required.");
			return;
		}

		setIsSendingEmail(true);

		try {
			const res = await sendEmail({
				recipientIds,
				subject: emailSubject,
				body: emailBody,
			}).unwrap();
			console.log(res);
			
			if (res.success) {
				toast.success("Email sent!");
				setIsBulkEmailDialogOpen(false);
				setIsEmailDialogOpen(false);
				setEmailSubject("");
				setEmailBody("");
				if (isBulkEmailDialogOpen) setSelectedUsers([]);
			}
		} catch (error) {
			toast.error("Failed to send email.");
		} finally {
			setIsSendingEmail(false);
		}
	};

	const handleSendEmailAll = async () => {
		const rawParticipants = allMembers?.members || [];
		setIsBulkEmailDialogOpen(true);
		const recipientIds: string[] = rawParticipants.map(
			(p: any) => p.UUID || p.id,
		);
	};

	if (isLoading)
		return (
			<div className="flex h-64 w-full items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
			</div>
		);

	return (
		<div className="space-y-8">
			{/* Hidden File Input for Import */}
			<input
				type="file"
				accept=".csv"
				ref={fileInputRef}
				onChange={handleImportCsv}
				className="hidden"
			/>

			{/* TOOLBAR */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4 items-center">
					<div className="flex items-center gap-2 w-full md:w-auto">
						<div className="relative w-full md:w-80">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 bg-white"
							/>
						</div>
						<div className="bg-gray-200/50 p-1 rounded-lg flex items-center border border-gray-200">
							{["all", "Active", "Inactive"].map((status) => (
								<button
									key={status}
									onClick={() => setFilterStatus(status)}
									className={cn(
										"px-4 py-1.5 text-sm font-medium rounded-md transition-all",
										filterStatus === status
											? "bg-white text-indigo-600 shadow-sm"
											: "text-gray-500 hover:text-gray-700",
									)}>
									{status === "all" ? "All" : status}
								</button>
							))}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={exportToCsv}>
							<Download className="w-4 h-4 mr-2" /> Export
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
							disabled={isImporting}>
							{isImporting ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Upload className="w-4 h-4 mr-2" />
							)}
							Import
						</Button>
						<Button
							size="sm"
							className="bg-indigo-600 text-white"
							onClick={() => {
								setIsOpen(true);
								handleResetForm();
							}}>
							<Plus className="w-4 h-4 mr-2" /> Add Member
						</Button>
						{selectedUsers.length > 0 ? (
							<Button
								size="sm"
								onClick={() => setIsBulkEmailDialogOpen(true)}
								className="bg-slate-900 text-white">
								<Mail className="w-4 h-4 mr-2" /> Email ({selectedUsers.length})
							</Button>
						) : (
							<>
								<Button
									size="sm"
									onClick={handleSendEmailAll}
									className="bg-slate-900 text-white">
									<Mail className="w-4 h-4 mr-2" /> Email (All)
								</Button>
							</>
						)}
					</div>
				</div>

				{/* TABLE */}
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50/50 border-gray-200 text-xs uppercase text-gray-500">
								<TableHead className="w-12 text-center">
									<Checkbox
										checked={isAllSelected}
										onCheckedChange={handleSelectAll}
									/>
								</TableHead>
								<TableHead className="w-[200px]">Member</TableHead>
								<TableHead>IDs</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead className="w-[200px]">Address</TableHead>
								<TableHead>Payment</TableHead>
								<TableHead>Activity</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={9}
										className="text-center h-32 text-gray-500">
										<Loader2 size={18} />
									</TableCell>
								</TableRow>
							) : (
								<>
									{rawParticipants.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={9}
												className="text-center h-32 text-gray-500">
												No members found.
											</TableCell>
										</TableRow>
									) : (
										rawParticipants.map((p: any) => (
											<TableRow
												key={p.UUID || p.id}
												onClick={() => handleViewParticipant(p)}
												className="cursor-pointer hover:bg-gray-50 transition-colors">
												<TableCell
													onClick={(e) => e.stopPropagation()}
													className="text-center">
													<Checkbox
														checked={selectedUsers.includes(
															p.UUID?.toString() || p.id?.toString(),
														)}
														onCheckedChange={(c) =>
															handleSelectUser(
																p.UUID?.toString() || p.id?.toString(),
																c as boolean,
															)
														}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-start gap-3">
														<div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100 shrink-0">
															{p.profileImage ? (
																<Image
																	src={p.profileImage}
																	width={40}
																	height={40}
																	alt=""
																	className="rounded-full object-cover"
																/>
															) : (
																(p.Name || p.firstName)?.[0]
															)}
														</div>
														<div className="flex flex-col gap-0.5">
															<p className="font-semibold text-gray-900 leading-none">
																{p.Name || `${p.firstName} ${p.lastName}`}
															</p>
															<div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
																<span className="bg-gray-100 px-1.5 rounded">
																	{p.Gender}
																</span>
																{p.DOB && (
																	<span>
																		{format(new Date(p.DOB), "MMM dd, yyyy")}
																	</span>
																)}
															</div>
															<div className="flex gap-2 mt-1">
																{p.WhatsappGroupMember && (
																	<MessageCircle className="w-3.5 h-3.5 text-green-500 fill-green-50" />
																)}
																{p.SendEmail && (
																	<Mail className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
																)}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-col gap-1 text-xs">
														<div className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded w-fit">
															<Hash className="w-3 h-3 text-gray-400" />
															<span className="font-mono">
																M: {p.MemberId || "-"}
															</span>
														</div>
														<div className="flex items-center gap-1 text-gray-500 px-2">
															<span className="font-mono">
																F: {p.FamilyId || "-"}
															</span>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-col gap-1 text-sm">
														<div className="text-gray-900">
															{p.EmailAddress || p.email}
														</div>
														<div className="text-gray-500 text-xs">
															{p.PhoneNo || p.phone}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-col gap-0.5 text-sm text-gray-600">
														<div className="flex items-start gap-1">
															<MapPin className="w-3 h-3 mt-1 text-gray-400 shrink-0" />
															<span>{p.Street}</span>
														</div>
														<div className="pl-4 text-xs text-gray-500">
															{p.City}, {p.State} {p.Zip}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-col gap-1 text-sm">
														<div className="font-medium text-emerald-700 flex items-center gap-1">
															<DollarSign className="w-3 h-3" />{" "}
															{p.Amount || "0"}
														</div>
														<div className="text-xs text-gray-500 flex items-center gap-1">
															<CalendarIcon className="w-3 h-3" /> {p.ForYear}
														</div>
														{p.TransactionDate && (
															<div className="text-[10px] text-gray-400">
																Paid:{" "}
																{format(new Date(p.TransactionDate), "MMM dd")}
															</div>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm text-gray-700 font-medium">
														{p.Activity || "-"}
													</div>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															p.Status === "Active" || p.status === "Active"
																? "default"
																: "secondary"
														}
														className={cn(
															"shadow-none font-normal",
															p.Status === "Active" || p.status === "Active"
																? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border"
																: "bg-gray-100 text-gray-600 border-gray-200 border hover:bg-gray-200",
														)}>
														{p.Status || p.status}
													</Badge>
												</TableCell>
												<TableCell className="text-right pr-4">
													<div onClick={(e) => e.stopPropagation()}>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8 text-gray-400 hover:text-indigo-600">
																	<MoreHorizontal className="w-4 h-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		handleEditParticipant(p);
																	}}>
																	<Edit className="w-4 h-4 mr-2" /> Edit
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		handleAddFamilyMemberAction(p);
																	}}>
																	<UserPlus className="w-4 h-4 mr-2" /> Add
																	Family Member
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		setSelectedParticipant(p);
																		setIsEmailDialogOpen(true);
																	}}>
																	<Mail className="w-4 h-4 mr-2" /> Email
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className="text-red-600"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDeleteParticipant(p);
																	}}>
																	<Trash className="w-4 h-4 mr-2" /> Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination Footer */}
				{(rawParticipants.length > 0 || currentPage > 1) && (
					<div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
						<p className="text-sm text-gray-500">
							Page {currentPage} of {members?.totalPages || 1}
						</p>
						<div className="flex justify-end items-end gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handlePreviousPage}
								disabled={keyHistory.length === 0}>
								<ChevronLeft className="w-4 h-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleNextPage}
								disabled={currentPage === members?.totalPages}>
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* --- ADD / EDIT DIALOG --- */}
			<Dialog
				open={isOpen || isEditDialogOpen}
				onOpenChange={(val) =>
					isOpen ? setIsOpen(val) : setIsEditDialogOpen(val)
				}>
				<DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{isOpen ? "Add Member" : "Edit Member"}</DialogTitle>
						<DialogDescription>
							Fill in the details exactly as required.
						</DialogDescription>
					</DialogHeader>

					{isLoopingCreation && (
						<div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
							<Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
							<p className="text-indigo-900 font-medium">Processing...</p>
						</div>
					)}

					<div className="grid gap-6 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2 md:col-span-1 grid gap-2">
								<Label>Full Name</Label>
								<Input
									value={editForm.Name}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, Name: e.target.value }))
									}
									placeholder="John Doe"
								/>
							</div>
							<div className="col-span-2 md:col-span-1 grid gap-2">
								<Label>Gender</Label>
								<Select
									value={editForm.Gender}
									onValueChange={(val) =>
										setEditForm((p) => ({ ...p, Gender: val }))
									}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="M">Male</SelectItem>
										<SelectItem value="F">Female</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Email Address</Label>
								<Input
									type="email"
									value={editForm.EmailAddress}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, EmailAddress: e.target.value }))
									}
									placeholder="abc@gmail.com"
								/>
							</div>
							<div className="grid gap-2">
								<Label>PhoneNo</Label>
								<Input
									type="tel"
									value={editForm.PhoneNo}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, PhoneNo: e.target.value }))
									}
									placeholder="1234567890"
								/>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="grid gap-2">
								<Label>DOB</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!editForm.DOB && "text-muted-foreground",
											)}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{editForm.DOB ? (
												format(editForm.DOB, "yyyy-MM-dd")
											) : (
												<span>YYYY-MM-DD</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="p-0">
										<Calendar
											mode="single"
											selected={editForm.DOB}
											onSelect={(date) =>
												setEditForm((p) => ({ ...p, DOB: date }))
											}
											fromYear={1900}
											toYear={new Date().getFullYear()}
											captionLayout="dropdown"
										/>
									</PopoverContent>
								</Popover>
							</div>
							<div className="grid gap-2">
								<Label>Activity</Label>
								<Input
									placeholder="e.g. Volleyball"
									value={editForm.Activity}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, Activity: e.target.value }))
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Status</Label>
								<Select
									value={editForm.Status}
									onValueChange={(val) =>
										setEditForm((p) => ({ ...p, Status: val }))
									}>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Active">Active</SelectItem>
										<SelectItem value="Inactive">Inactive</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-3 border rounded-xl p-4 bg-gray-50/50">
							<Label className="font-semibold">Address</Label>
							<div className="grid grid-cols-2 gap-3">
								<Input
									value={editForm.Street}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, Street: e.target.value }))
									}
									placeholder="Street"
									className="bg-white col-span-2"
								/>
								<Input
									value={editForm.City}
									onChange={(e) =>
										setEditForm((p) => ({ ...p, City: e.target.value }))
									}
									placeholder="City"
									className="bg-white"
								/>
								<div className="grid grid-cols-2 gap-2">
									<Select
										value={editForm.State}
										onValueChange={(val) =>
											setEditForm((p) => ({ ...p, State: val }))
										}>
										<SelectTrigger className="bg-white">
											<SelectValue placeholder="State" />
										</SelectTrigger>
										<SelectContent className="max-h-60">
											{US_STATES.map((s) => (
												<SelectItem
													key={s}
													value={s}>
													{s}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										value={editForm.Zip}
										onChange={(e) =>
											setEditForm((p) => ({ ...p, Zip: e.target.value }))
										}
										placeholder="Zip"
										className="bg-white"
									/>
								</div>
							</div>
						</div>

						<div className="flex gap-6">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="wa"
									checked={editForm.WhatsappGroupMember}
									onCheckedChange={(c) =>
										setEditForm((p) => ({
											...p,
											WhatsappGroupMember: c as boolean,
										}))
									}
								/>
								<Label htmlFor="wa">WhatsappGroupMember</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="email"
									checked={editForm.SendEmail}
									onCheckedChange={(c) =>
										setEditForm((p) => ({ ...p, SendEmail: c as boolean }))
									}
								/>
								<Label htmlFor="email">SendEmail</Label>
							</div>
						</div>

						{/* --- PRIMARY MEMBER PAYMENT SECTION UPDATED --- */}
						<div className="space-y-3 border rounded-xl p-4 bg-emerald-50/50 border-emerald-100">
							<div className="flex items-center gap-2 text-emerald-800 font-semibold">
								<DollarSign className="w-4 h-4" /> Payment Details
							</div>
							<div className="grid grid-cols-2 gap-4">
								{/* Row 1: Amount & Transaction Date */}
								<div className="grid gap-2">
									<Label className="text-xs">Amount</Label>
									<Input
										type="number"
										value={editForm.Amount}
										onChange={(e) =>
											setEditForm((p) => ({ ...p, Amount: e.target.value }))
										}
										className="bg-white"
										placeholder="10$"
									/>
								</div>
								<div className="grid gap-2">
									<Label className="text-xs">TransactionDate</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal bg-white h-9">
												{editForm.TransactionDate ? (
													format(editForm.TransactionDate, "yyyy-MM-dd")
												) : (
													<span>Pick date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0">
											<Calendar
												mode="single"
												selected={editForm.TransactionDate}
												onSelect={(d) =>
													setEditForm((p) => ({ ...p, TransactionDate: d }))
												}
											/>
										</PopoverContent>
									</Popover>
								</div>

								{/* Row 2: Deposit Date & For Year */}
								<div className="grid gap-2">
									<Label className="text-xs">DepositDate</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal bg-white h-9">
												{editForm.DepositDate ? (
													format(editForm.DepositDate, "yyyy-MM-dd")
												) : (
													<span>Pick date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0">
											<Calendar
												mode="single"
												selected={editForm.DepositDate}
												onSelect={(d) =>
													setEditForm((p) => ({ ...p, DepositDate: d }))
												}
											/>
										</PopoverContent>
									</Popover>
								</div>
								<div className="grid gap-2">
									<Label className="text-xs">ForYear</Label>
									<Input
										value={editForm.ForYear}
										onChange={(e) =>
											setEditForm((p) => ({ ...p, ForYear: e.target.value }))
										}
										className="bg-white"
									/>
								</div>

								{/* Row 3: Comments (Full Width) */}
								<div className="col-span-2 grid gap-2">
									<Label className="text-xs">Comments</Label>
									<Input
										value={editForm.Comments}
										onChange={(e) =>
											setEditForm((p) => ({ ...p, Comments: e.target.value }))
										}
										className="bg-white"
										placeholder="Add comments here..."
									/>
								</div>
							</div>
						</div>

						{/* --- FAMILY MEMBERS LOOP --- */}
						{(isOpen || isEditingPrimary) && (
							<div className="space-y-4 pt-4 border-t border-gray-100">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="has-family"
											checked={hasFamily}
											onCheckedChange={(checked) => {
												setHasFamily(checked as boolean);
												if (checked && editForm.familyMembers.length === 0)
													addFamilyMemberRow();
											}}
										/>
										<Label htmlFor="has-family">Add Family Members</Label>
									</div>
									{hasFamily && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addFamilyMemberRow}>
											<UserPlus className="w-3 h-3 mr-1" /> Add
										</Button>
									)}
								</div>

								{hasFamily && (
									<div className="grid grid-cols-1 gap-6">
										{editForm.familyMembers.map((member, idx) => (
											<div
												key={idx}
												className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative grid gap-4">
												<div className="absolute top-2 right-2">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-6 w-6 text-gray-400 hover:text-red-500"
														onClick={() => removeFamilyMemberRow(idx)}>
														<X className="w-4 h-4" />
													</Button>
												</div>
												<h4 className="font-semibold text-sm text-gray-700">
													Family Member #{idx + 1}
												</h4>

												<div className="grid grid-cols-2 gap-3">
													<div className="col-span-1 grid gap-1.5">
														<Label className="text-xs text-gray-500">
															Full Name
														</Label>
														<Input
															className="h-9 bg-white"
															value={member.Name}
															onChange={(e) =>
																updateFamilyMember(idx, "Name", e.target.value)
															}
															placeholder="John Doe"
														/>
													</div>
													<div className="col-span-1 grid gap-1.5">
														<Label className="text-xs text-gray-500">
															Gender
														</Label>
														<Select
															value={member.Gender}
															onValueChange={(v) =>
																updateFamilyMember(idx, "Gender", v)
															}>
															<SelectTrigger className="h-9 w-full bg-white">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="M">Male</SelectItem>
																<SelectItem value="F">Female</SelectItem>
															</SelectContent>
														</Select>
													</div>
												</div>

												<div className="grid grid-cols-2 gap-3">
													<div className="grid gap-1.5">
														<Label className="text-xs text-gray-500">
															Email
														</Label>
														<Input
															className="h-9 bg-white"
															value={member.EmailAddress}
															onChange={(e) =>
																updateFamilyMember(
																	idx,
																	"EmailAddress",
																	e.target.value,
																)
															}
															placeholder="abc@gmail.com"
														/>
													</div>
													<div className="grid gap-1.5">
														<Label className="text-xs text-gray-500">
															Phone
														</Label>
														<Input
															className="h-9 bg-white"
															value={member.PhoneNo}
															onChange={(e) =>
																updateFamilyMember(
																	idx,
																	"PhoneNo",
																	e.target.value,
																)
															}
															placeholder="1234567890"
														/>
													</div>
												</div>

												<div className="grid grid-cols-3 gap-3">
													<div className="grid gap-1.5">
														<Label className="text-xs text-gray-500">DOB</Label>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="outline"
																	className={cn(
																		"w-full justify-start text-left font-normal h-9 bg-white text-xs",
																		!member.DOB && "text-muted-foreground",
																	)}>
																	{member.DOB ? (
																		format(member.DOB, "yyyy-MM-dd")
																	) : (
																		<span>YYYY-MM-DD</span>
																	)}
																</Button>
															</PopoverTrigger>
															<PopoverContent className="p-0">
																<Calendar
																	mode="single"
																	selected={member.DOB}
																	onSelect={(d) =>
																		updateFamilyMember(idx, "DOB", d)
																	}
																	fromYear={1900}
																	toYear={new Date().getFullYear()}
																	captionLayout="dropdown"
																/>
															</PopoverContent>
														</Popover>
													</div>
													<div className="grid gap-1.5">
														<Label className="text-xs text-gray-500">
															Activity
														</Label>
														<Input
															className="h-9 bg-white"
															placeholder="e.g. Volleyball"
															value={member.Activity}
															onChange={(e) =>
																updateFamilyMember(
																	idx,
																	"Activity",
																	e.target.value,
																)
															}
														/>
													</div>
													<div className="grid gap-1.5">
														<Label className="text-xs text-gray-500">
															Status
														</Label>
														<Select
															value={member.Status}
															onValueChange={(v) =>
																updateFamilyMember(idx, "Status", v)
															}>
															<SelectTrigger className="h-9 w-full bg-white">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="Active">Active</SelectItem>
																<SelectItem value="Inactive">
																	Inactive
																</SelectItem>
															</SelectContent>
														</Select>
													</div>
												</div>

												<div className="bg-white p-3 rounded border border-gray-200">
													<Label className="text-xs font-semibold mb-2 block">
														Address
													</Label>
													<div className="grid grid-cols-2 gap-2">
														<Input
															className="h-8 text-xs col-span-2"
															placeholder="Street"
															value={member.Street}
															onChange={(e) =>
																updateFamilyMember(
																	idx,
																	"Street",
																	e.target.value,
																)
															}
														/>
														<Input
															className="h-8 text-xs"
															placeholder="City"
															value={member.City}
															onChange={(e) =>
																updateFamilyMember(idx, "City", e.target.value)
															}
														/>
														<div className="grid grid-cols-2 gap-1">
															<Input
																className="h-8 text-xs"
																placeholder="State"
																value={member.State}
																onChange={(e) =>
																	updateFamilyMember(
																		idx,
																		"State",
																		e.target.value,
																	)
																}
															/>
															<Input
																className="h-8 text-xs"
																placeholder="Zip"
																value={member.Zip}
																onChange={(e) =>
																	updateFamilyMember(idx, "Zip", e.target.value)
																}
															/>
														</div>
													</div>
												</div>

												<div className="flex gap-4">
													<div className="flex items-center space-x-2">
														<Checkbox
															id={`wa-${idx}`}
															checked={member.WhatsappGroupMember}
															onCheckedChange={(c) =>
																updateFamilyMember(
																	idx,
																	"WhatsappGroupMember",
																	c,
																)
															}
														/>
														<Label
															htmlFor={`wa-${idx}`}
															className="text-xs">
															Whatsapp
														</Label>
													</div>
													<div className="flex items-center space-x-2">
														<Checkbox
															id={`email-${idx}`}
															checked={member.SendEmail}
															onCheckedChange={(c) =>
																updateFamilyMember(idx, "SendEmail", c)
															}
														/>
														<Label
															htmlFor={`email-${idx}`}
															className="text-xs">
															Email
														</Label>
													</div>
												</div>

												{/* --- FAMILY MEMBER PAYMENT SECTION UPDATED --- */}
												{/* <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
													<Label className="text-xs font-semibold mb-2 block text-emerald-800">
														Payment
													</Label>
													<div className="grid grid-cols-2 gap-2">
														<Input
															className="h-8 bg-white text-xs"
															type="number"
															placeholder="Amount"
															value={member.Amount}
															onChange={(e) =>
																updateFamilyMember(
																	idx,
																	"Amount",
																	e.target.value,
																)
															}
														/>

														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="outline"
																	className="w-full justify-start text-left font-normal bg-white h-8 text-xs px-2">
																	{member.TransactionDate ? (
																		format(member.TransactionDate, "yyyy-MM-dd")
																	) : (
																		<span className="text-muted-foreground">
																			Trans. Date
																		</span>
																	)}
																</Button>
															</PopoverTrigger>
															<PopoverContent className="p-0">
																<Calendar
																	mode="single"
																	selected={member.TransactionDate}
																	onSelect={(d) =>
																		updateFamilyMember(
																			idx,
																			"TransactionDate",
																			d,
																		)
																	}
																/>
															</PopoverContent>
														</Popover>

														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="outline"
																	className="w-full justify-start text-left font-normal bg-white h-8 text-xs px-2">
																	{member.DepositDate ? (
																		format(member.DepositDate, "yyyy-MM-dd")
																	) : (
																		<span className="text-muted-foreground">
																			Dep. Date
																		</span>
																	)}
																</Button>
															</PopoverTrigger>
															<PopoverContent className="p-0">
																<Calendar
																	mode="single"
																	selected={member.DepositDate}
																	onSelect={(d) =>
																		updateFamilyMember(idx, "DepositDate", d)
																	}
																/>
															</PopoverContent>
														</Popover>

														<Input
															className="h-8 bg-white text-xs"
															placeholder="Year"
															value={member.ForYear}
															onChange={(e) =>
																updateFamilyMember(
																	idx,
																	"ForYear",
																	e.target.value,
																)
															}
														/>

														<Input
															className="h-8 bg-white text-xs col-span-2"
															placeholder="Comments"
															value={member.Comments}
															onChange={(e) =>
																updateFamilyMember(
																	idx,
																	"Comments",
																	e.target.value,
																)
															}
														/>
													</div>
												</div> */}
											</div>
										))}
									</div>
								)}
							</div>
						)}

						<DialogFooter>
							<Button
								variant="outline"
								onClick={handleCancelEdit}>
								Cancel
							</Button>
							<Button
								onClick={isOpen ? addParticipant : handleSaveEdit}
								disabled={isLoopingCreation || isEditLoading}
								className="bg-indigo-600 text-white">
								{isLoopingCreation || isEditLoading
									? "Saving..."
									: isOpen
										? "Submit"
										: "Save Changes"}
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>

			{/* Email & View Dialogs */}
			<Dialog
				open={isEmailDialogOpen || isBulkEmailDialogOpen}
				onOpenChange={(val) =>
					isBulkEmailDialogOpen
						? setIsBulkEmailDialogOpen(val)
						: setIsEmailDialogOpen(val)
				}>
				<DialogContent className="max-w-4xl rounded-2xl h-[90vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>Send Email</DialogTitle>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto pr-2 space-y-4 py-2">
						<div className="grid gap-2">
							<Label>Template</Label>
							<Select
								value={emailTemplate}
								onValueChange={handleEmailTemplateChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select Template" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="custom">Custom Email</SelectItem>
									{emailTemplates.map((t: any) => (
										<SelectItem
											key={t.id}
											value={t.id}>
											{t.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label>Subject</Label>
							<Input
								value={emailSubject}
								onChange={(e) => setEmailSubject(e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label>Message</Label>
							<div className="quill-wrapper h-64 sm:h-80">
								<ReactQuill
									theme="snow"
									value={emailBody}
									onChange={setEmailBody}
									className="h-full"
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-end gap-2 pt-4 mt-auto">
						<Button
							onClick={handleSendEmail}
							disabled={isSendingEmail}
							className="bg-indigo-600 text-white">
							{isSendingEmail ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
								</>
							) : (
								<>
									<Send className="w-4 h-4 mr-2" /> Send Email
								</>
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isViewDialogOpen}
				onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-xl rounded-2xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Details</DialogTitle>
					</DialogHeader>
					{selectedParticipant && (
						<div className="space-y-6">
							<div className="flex items-center gap-4 pb-4 border-b border-gray-100">
								<div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
									{selectedParticipant.profileImage ? (
										<Image
											src={selectedParticipant.profileImage}
											width={64}
											height={64}
											alt=""
											className="w-full h-full object-cover rounded-full"
										/>
									) : (
										(selectedParticipant.Name ||
											selectedParticipant.firstName)?.[0]
									)}
								</div>
								<div>
									<h3 className="text-lg font-bold">
										{selectedParticipant.Name ||
											`${selectedParticipant.firstName} ${selectedParticipant.lastName}`}
									</h3>
									<p className="text-sm text-gray-500 font-mono">
										ID: {selectedParticipant.UUID || selectedParticipant.id}
									</p>
									<div className="flex gap-2 mt-2">
										{selectedParticipant.WhatsappGroupMember && (
											<Badge
												variant="secondary"
												className="bg-green-100 text-green-700">
												Whatsapp
											</Badge>
										)}
										{selectedParticipant.SendEmail && (
											<Badge
												variant="secondary"
												className="bg-blue-100 text-blue-700">
												Email
											</Badge>
										)}
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<Label className="text-xs text-gray-500 uppercase tracking-wide">
											Contact
										</Label>
										<div className="font-medium mt-1">
											{selectedParticipant.EmailAddress ||
												selectedParticipant.email}
										</div>
										<div className="text-sm text-gray-600">
											{selectedParticipant.PhoneNo || selectedParticipant.phone}
										</div>
									</div>

									<div>
										<Label className="text-xs text-gray-500 uppercase tracking-wide">
											Address
										</Label>
										<div className="font-medium mt-1">
											{selectedParticipant.Street}
										</div>
										<div className="text-sm text-gray-600">
											{selectedParticipant.City}, {selectedParticipant.State}{" "}
											{selectedParticipant.Zip}
										</div>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<Label className="text-xs text-gray-500 uppercase tracking-wide">
											Status
										</Label>
										<div className="mt-1 flex items-center gap-2">
											<Badge>
												{selectedParticipant.Status ||
													selectedParticipant.status ||
													"Active"}
											</Badge>
											<span className="text-sm text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md bg-gray-50">
												{selectedParticipant.Activity || "No Activity"}
											</span>
										</div>
									</div>

									{/* --- VIEW PARTICIPANT PAYMENT SECTION UPDATED --- */}
									<div>
										<Label className="text-xs text-gray-500 uppercase tracking-wide">
											Payment
										</Label>
										<div className="font-medium mt-1 text-emerald-700 flex items-center gap-1">
											<DollarSign className="w-4 h-4" />
											{selectedParticipant.Amount || "0"}
											<span className="text-gray-400 font-normal text-xs ml-2">
												For Year: {selectedParticipant.ForYear}
											</span>
										</div>

										<div className="grid grid-cols-2 gap-2 mt-2">
											<div className="bg-gray-50 p-2 rounded text-xs">
												<span className="text-gray-500 block mb-0.5">
													Transaction Date
												</span>
												{selectedParticipant.TransactionDate
													? format(
															new Date(selectedParticipant.TransactionDate),
															"MMM dd, yyyy",
														)
													: "-"}
											</div>
											<div className="bg-gray-50 p-2 rounded text-xs">
												<span className="text-gray-500 block mb-0.5">
													Deposit Date
												</span>
												{selectedParticipant.DepositDate
													? format(
															new Date(selectedParticipant.DepositDate),
															"MMM dd, yyyy",
														)
													: "-"}
											</div>
										</div>

										{selectedParticipant.Comments && (
											<div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
												<span className="text-xs text-gray-400 block mb-0.5 uppercase">
													Comments
												</span>
												{selectedParticipant.Comments}
											</div>
										)}
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsViewDialogOpen(false)}>
									Close
								</Button>
								<Button
									onClick={() => {
										setIsViewDialogOpen(false);
										handleEditParticipant(selectedParticipant);
									}}>
									Edit
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ParticipantsPage;
