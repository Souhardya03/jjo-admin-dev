"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
	CalendarIcon,
	UserPlus,
	X,
	DollarSign,
	Wallet,
	CreditCard,
	MapPin,
	Users,
	Info,
	Loader2,
	Award,
	UserLock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"; // Ensure your calendar component supports captionLayout="dropdown"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAddMembersMutation } from "@/store/features/members";
import Image from "next/image";

// --- 1. VALIDATION SCHEMA ---
const schema = z.object({
	Name: z.string().min(2, "Full Name is required"),
	Gender: z.string().min(1, "Required"),
	EmailAddress: z.string().email("Invalid email"),
	PhoneNo: z.string().min(10, "Invalid phone"),
	DOB: z.date({ error: "DOB required" }),
	Street: z.string().min(1, "Street required"),
	City: z.string().min(1, "City required"),
	State: z.string().min(1, "State required"),
	Zip: z.string().min(5, "Zip required"),
	PaymentMethod: z.enum(["Zelle", "PayPal"]),
	Amount: z.string().min(1, "Amount required"),
	TransactionDate: z.date({ error: "Date required" }),
	familyMembers: z.array(
		z.object({
			Name: z.string().min(2, "Required"),
			Gender: z.string().min(1, "Required"),
			DOB: z.date().optional(),
		}),
	),
});

type FormData = z.infer<typeof schema>;

// --- 2. ELEGANT LIGHT NAVBAR ---
function Navbar() {
	return (
		<nav className="flex items-center justify-between px-8 py-4 bg-[#fdfbf7] border-b-2 border-[#eaddc7] sticky top-0 z-[100]">
			<div className="flex items-center gap-3">
				<Image
					src={"/images/JJOLogo.png"}
					alt="JJO Logo"
					width={60}
					height={60}
				/>
				<span className="text-xl font-serif font-bold tracking-tight text-[#4a3f35]">
					JJO <span className="text-[#b49157]">Registration</span>
				</span>
			</div>
			<Link href="/login">
				<Button
					variant="ghost"
					className="gap-2 text-[#4a3f35] hover:bg-[#b49157]/10 rounded-lg">
					<UserLock className="w-4 h-4 text-[#b49157]" />
					Admin
				</Button>
			</Link>
		</nav>
	);
}

// --- 3. MAIN REGISTRATION PAGE ---
export default function RegistrationForm() {
	const [isLoopingCreation, setIsLoopingCreation] = useState(false);
	const [addMembers] = useAddMembersMutation();

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { PaymentMethod: "Zelle", familyMembers: [] },
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "familyMembers",
	});
	const selectedMethod = watch("PaymentMethod");

	const onSubmit = async (values: FormData) => {
		setIsLoopingCreation(true);
		let successCount = 0;
		try {
			const primaryRes = await addMembers(values).unwrap();
			if (primaryRes && primaryRes.success) {
				successCount++;
				const newFamilyId = primaryRes.FamilyId;
				if (values.familyMembers.length > 0 && newFamilyId) {
					for (const famMember of values.familyMembers) {
						try {
							const newFamData = {
								...famMember,
								FamilyId: newFamilyId,
								Street: values.Street,
								City: values.City,
								State: values.State,
								Zip: values.Zip,
							};
							const famRes = await addMembers(newFamData).unwrap();
							if (famRes.success) successCount++;
						} catch (err) {
							toast.error(`Error adding ${famMember.Name}`);
						}
					}
				}
				toast.success(`Registered ${successCount} member(s).`);
				reset();
			}
		} catch (error) {
			toast.error("Registration failed.");
		} finally {
			setIsLoopingCreation(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#f8f5f0] pb-20 font-sans">
			<Navbar />

			<main className="max-w-4xl mx-auto py-12 px-4">
				<div className="text-center mb-12">
					<Award className="w-10 h-10 text-[#b49157] mx-auto mb-4" />
					<h1 className="text-4xl font-serif font-bold text-[#2d2a26]">
						Member Enrolment
					</h1>
					<p className="text-[#8c7e6d] mt-2 italic">
						Cultivating community and heritage{" "}
					</p>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-8">
					{/* CARD: PRIMARY INFO */}
					<div className="bg-white rounded-2xl shadow-sm border border-[#eaddc7] overflow-hidden">
						<div className="bg-[#fdfbf7] px-8 py-4 border-b border-[#eaddc7] flex items-center gap-2">
							<Info className="w-4 h-4 text-[#b49157]" />
							<h3 className="font-bold text-[#4a3f35] text-sm uppercase tracking-widest">
								01. Attendee Profile
							</h3>
						</div>

						<div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-1.5">
								<Label className="text-[#6b5f52] font-semibold text-xs uppercase">
									Full Name
								</Label>
								<Input
									{...register("Name")}
									placeholder="Enter name"
									className={cn(
										"border-[#eaddc7] focus:border-[#b49157]",
										errors.Name && "border-red-500",
									)}
								/>
								{errors.Name && (
									<p className="text-red-500 text-[10px] italic">
										{errors.Name.message}
									</p>
								)}
							</div>
							<div className="space-y-1.5">
								<Label className="text-[#6b5f52] font-semibold text-xs uppercase">
									Email Address
								</Label>
								<Input
									{...register("EmailAddress")}
									type="email"
									placeholder="email@fest.com"
									className={cn(
										"border-[#eaddc7]",
										errors.EmailAddress && "border-red-500",
									)}
								/>
								{errors.EmailAddress && (
									<p className="text-red-500 text-[10px] italic">
										{errors.EmailAddress.message}
									</p>
								)}
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label className="text-[#6b5f52] font-semibold text-xs uppercase">
										Gender
									</Label>
									<Controller
										control={control}
										name="Gender"
										render={({ field }) => (
											<Select
												onValueChange={field.onChange}
												value={field.value}>
												<SelectTrigger
													className={cn(
														"border-[#eaddc7] w-full",
														errors.Gender && "border-red-500",
													)}>
													<SelectValue placeholder="Select" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="M">Male</SelectItem>
													<SelectItem value="F">Female</SelectItem>
												</SelectContent>
											</Select>
										)}
									/>
									{errors.Gender && (
										<p className="text-red-500 text-[10px] italic">
											{errors.Gender.message}
										</p>
									)}
								</div>
								<div className="space-y-1.5">
									<Label className="text-[#6b5f52] font-semibold text-xs uppercase">
										DOB
									</Label>
									<Controller
										control={control}
										name="DOB"
										render={({ field }) => (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className={cn(
															"w-full h-11 border-[#eaddc7] justify-start text-xs font-normal",
															errors.DOB && "border-red-500",
														)}>
														<CalendarIcon className="mr-2 h-3 w-3 text-[#b49157]" />
														{field.value
															? format(field.value, "PPP")
															: "MM/DD/YYYY"}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="p-0">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														captionLayout="dropdown-years"
														fromYear={1920}
														toYear={2026}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										)}
									/>
									{errors.DOB && (
										<p className="text-red-500 text-[10px] italic">
											{errors.DOB.message}
										</p>
									)}
								</div>
							</div>
							<div className="space-y-1.5">
								<Label className="text-[#6b5f52] font-semibold text-xs uppercase">
									Phone Number
								</Label>
								<Input
									{...register("PhoneNo")}
									placeholder="123-456-7890"
									className={cn(
										"border-[#eaddc7]",
										errors.PhoneNo && "border-red-500",
									)}
								/>
								{errors.PhoneNo && (
									<p className="text-red-500 text-[10px] italic">
										{errors.PhoneNo.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* CARD: ADDRESS */}
					<div className="bg-white rounded-2xl shadow-sm border border-[#eaddc7] overflow-hidden">
						<div className="bg-[#fdfbf7] px-8 py-4 border-b border-[#eaddc7] flex items-center gap-2">
							<MapPin className="w-4 h-4 text-[#b49157]" />
							<h3 className="font-bold text-[#4a3f35] text-sm uppercase tracking-widest">
								02. Mailing Address
							</h3>
						</div>
						<div className="p-8 space-y-4">
							<div>
								<Input
									{...register("Street")}
									placeholder="Street Address"
									className={cn(
										"border-[#eaddc7]",
										errors.Street && "border-red-500",
									)}
								/>
								{errors.Street && (
									<p className="text-red-500 text-[10px] italic ml-1 mt-1">
										{errors.Street.message}
									</p>
								)}
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<Input
										{...register("City")}
										placeholder="City"
										className={cn(
											"border-[#eaddc7]",
											errors.City && "border-red-500",
										)}
									/>
									{errors.City && (
										<p className="text-red-500 text-[10px] italic mt-1">
											{errors.City.message}
										</p>
									)}
								</div>
								<div>
									<Input
										{...register("State")}
										placeholder="State"
										className={cn(
											"border-[#eaddc7]",
											errors.State && "border-red-500",
										)}
									/>
									{errors.State && (
										<p className="text-red-500 text-[10px] italic mt-1">
											{errors.State.message}
										</p>
									)}
								</div>
								<div>
									<Input
										{...register("Zip")}
										placeholder="Zip"
										className={cn(
											"border-[#eaddc7]",
											errors.Zip && "border-red-500",
										)}
									/>
									{errors.Zip && (
										<p className="text-red-500 text-[10px] italic mt-1">
											{errors.Zip.message}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* CARD: PAYMENT */}
					<div className="bg-[#f3ede4] rounded-2xl border-2 border-[#b49157]/20 p-8 space-y-6">
						<h3 className="font-bold text-[#2d2a26] text-center uppercase tracking-widest flex items-center justify-center gap-2">
							<DollarSign className="w-4 h-4 text-[#b49157]" /> Transfer Details
						</h3>

						<div className="grid grid-cols-2 gap-4">
							{["Zelle", "PayPal"].map((method) => (
								<button
									key={method}
									type="button"
									onClick={() =>
										setValue(
											"PaymentMethod",
											method as unknown as FormData["PaymentMethod"],
										)
									}
									className={cn(
										"flex items-center justify-center gap-3 py-6 rounded-xl border-2 transition-all",
										selectedMethod === method
											? "bg-white border-[#b49157] text-[#b49157] shadow-md ring-4 ring-[#b49157]/5"
											: "bg-white/50 border-[#eaddc7] text-[#8c7e6d] hover:bg-white",
									)}>
									{method === "Zelle" ? (
										<Wallet className="w-6 h-6" />
									) : (
										<CreditCard className="w-6 h-6" />
									)}
									<span className="font-bold uppercase text-xs">{method}</span>
								</button>
							))}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-1.5">
								<Label className="text-[#6b5f52] font-semibold text-xs uppercase">
									Transaction Amount
								</Label>
								<Input
									{...register("Amount")}
									type="number"
									className={cn(
										"bg-white border-[#eaddc7]",
										errors.Amount && "border-red-500",
									)}
									placeholder="0.00"
								/>
								{errors.Amount && (
									<p className="text-red-500 text-[10px] italic">
										{errors.Amount.message}
									</p>
								)}
							</div>
							<div className="space-y-1.5">
								<Label className="text-[#6b5f52] font-semibold text-xs uppercase">
									Payment Date
								</Label>
								<Controller
									control={control}
									name="TransactionDate"
									render={({ field }) => (
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full h-11 bg-white border-[#eaddc7] justify-start text-xs font-normal",
														errors.TransactionDate && "border-red-500",
													)}>
													<CalendarIcon className="mr-2 h-3 w-3 text-[#b49157]" />
													{field.value
														? format(field.value, "PPP")
														: "Select Date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													captionLayout="dropdown-years"
													fromYear={2024}
													toYear={2026}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									)}
								/>
								{errors.TransactionDate && (
									<p className="text-red-500 text-[10px] italic">
										{errors.TransactionDate.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* DYNAMIC FAMILY MEMBERS */}
					<div className="space-y-4">
						<div className="flex items-center justify-between px-2">
							<div className="flex items-center gap-2 text-[#4a3f35] font-bold uppercase tracking-widest text-xs">
								<Users className="w-4 h-4 text-[#b49157]" /> Additional Members
							</div>
							<Button
								type="button"
								onClick={() => append({ Name: "", Gender: "M" })}
								className="bg-[#b49157] hover:bg-[#927443] text-white rounded-lg h-8 px-4 text-xs font-bold">
								+ Add Family
							</Button>
						</div>

						<div className="grid gap-4">
							{fields.map((field, index) => (
								<div
									key={field.id}
									className="group relative p-6 bg-white rounded-2xl border border-[#eaddc7] grid grid-cols-1 md:grid-cols-4 gap-4 items-end transition-shadow hover:shadow-lg">
									<Button
										type="button"
										variant="ghost"
										onClick={() => remove(index)}
										className="absolute -top-2 -right-2 bg-red-50 text-red-500 rounded-full w-8 h-8 p-0 border border-red-100 hover:bg-red-500 hover:text-white transition-colors">
										<X className="w-4 h-4" />
									</Button>
									<div className="md:col-span-2 space-y-1.5">
										<Label className="text-[10px] uppercase font-bold text-[#b49157]">
											Name
										</Label>
										<Input
											{...register(`familyMembers.${index}.Name`)}
											className={cn(
												"h-10 bg-[#fdfbf7] border-[#eaddc7]",
												errors.familyMembers?.[index]?.Name && "border-red-500",
											)}
										/>
										{errors.familyMembers?.[index]?.Name && (
											<p className="text-red-500 text-[10px] italic">
												{errors.familyMembers[index].Name.message}
											</p>
										)}
									</div>
									<div>
										<Label className="text-[10px] uppercase font-bold text-[#b49157]">
											Gender
										</Label>
										<Controller
											control={control}
											name={`familyMembers.${index}.Gender`}
											render={({ field }) => (
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<SelectTrigger
														className={cn(
															"h-11 w-full bg-[#fdfbf7] border-[#eaddc7]",
															errors.familyMembers?.[index]?.Gender &&
																"border-red-500",
														)}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="M">Male</SelectItem>
														<SelectItem value="F">Female</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>
									<div className="space-y-1.5">
										<Label className="text-[10px] uppercase font-bold text-[#b49157]">
											DOB
										</Label>
										<Controller
											control={control}
											name={`familyMembers.${index}.DOB`}
											render={({ field }) => (
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className="w-full h-10 bg-[#fdfbf7] border-[#eaddc7] justify-start text-[10px] px-2 font-normal">
															{field.value
																? format(field.value, "MM/dd/yy")
																: "Select"}
														</Button>
													</PopoverTrigger>
													<PopoverContent className="p-0">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={field.onChange}
															captionLayout="dropdown-years"
															fromYear={1920}
															toYear={2026}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											)}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					<Button
						type="submit"
						disabled={isLoopingCreation}
						className="w-full h-16 bg-[#2d2a26] hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]">
						{isLoopingCreation ? (
							<span className="flex items-center gap-3">
								<Loader2 className="w-6 h-6 animate-spin text-[#b49157]" />{" "}
								PROCESSING...
							</span>
						) : (
							"Complete Enrolment"
						)}
					</Button>
				</form>
			</main>
		</div>
	);
}
