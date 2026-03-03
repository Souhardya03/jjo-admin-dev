"use client";
import { useEffect } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { format } from "date-fns";
import {
	CalendarIcon,
	CreditCard,
	Users,
	Utensils,
	AlertCircle,
	Heart,
	CalendarHeart,
	UserLock,
} from "lucide-react";

// --- Shadcn Imports ---
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import Image from "next/image";
import Link from "next/link";

// --- 1. Rates from your API logic ---
const RATE_PLAN = {
	child_amount: 300.0,
	adult_amount: 500.0,
	rate_plan_id: "a4685092-5c2c-4fb2-a3ac-ee67762a1f06",
};

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
			<div className="flex items-center gap-4">
				<Link href="/events">
					<Button
						variant="ghost"
						className="gap-2 text-[#4a3f35] hover:bg-[#b49157]/10 rounded-lg">
						<CalendarHeart className="w-4 h-4 text-[#b49157]" />
						Events
					</Button>
				</Link>
				<Link href="/login">
					<Button
						variant="ghost"
						className="gap-2 text-[#4a3f35] hover:bg-[#b49157]/10 rounded-lg">
						<UserLock className="w-4 h-4 text-[#b49157]" />
						Admin
					</Button>
				</Link>
			</div>
		</nav>
	);
}

// --- 2. Zod Schema ---
const registrationSchema = z.object({
	primary_guest_name: z.string().min(2, "Full name is required"),
	primary_guest_email: z.string().email("Invalid email address"),
	primary_guest_ph: z.string().min(10, "Invalid phone number"),
	event_registration_date: z.date(),
	total_amount: z.number(),
	additional_donation: z.number().min(0),
	additional_donation_type: z.string(),
	adult_count: z.number().min(1, "At least one adult is required"),
	child_count: z.number().min(0),
	senior_count: z.number().min(0),
	student_count: z.number().min(0),
	food_preference: z.string(),
	payment_mode: z.string(),
	event_id: z.string().optional(),
	rate_plan_id: z.string().optional(),
});

type FormValues = z.infer<typeof registrationSchema>;

export default function EventRegistration() {
	const formik = useFormik<FormValues>({
		initialValues: {
			primary_guest_name: "",
			primary_guest_email: "",
			primary_guest_ph: "",
			event_registration_date: new Date(),
			total_amount: 500,
			additional_donation: 0,
			additional_donation_type: "General",
			adult_count: 1,
			child_count: 0,
			senior_count: 0,
			student_count: 0,
			food_preference: "Veg",
			payment_mode: "zelle",
			event_id: "ff7bb331-665d-4e3b-8b59-20a5270ad8a0",
			rate_plan_id: RATE_PLAN.rate_plan_id,
		},
		validationSchema: toFormikValidationSchema(registrationSchema),
		onSubmit: (values) => {
			const apiPayload = {
				...values,
				event_registration_date: values.event_registration_date.toISOString(),
			};
			console.log("Submitting:", apiPayload);
			alert(JSON.stringify(apiPayload, null, 2));
		},
	});

	// --- 3. Calculation Logic ---
	useEffect(() => {
		const {
			adult_count,
			senior_count,
			student_count,
			child_count,
			additional_donation,
		} = formik.values;
		const adults =
			(Number(adult_count) || 0) +
			(Number(senior_count) || 0) +
			(Number(student_count) || 0);
		const children = Number(child_count) || 0;
		const donation = Number(additional_donation) || 0;

		const newTotal =
			adults * RATE_PLAN.adult_amount +
			children * RATE_PLAN.child_amount +
			donation;
		formik.setFieldValue("total_amount", newTotal);
	}, [
		formik.values.adult_count,
		formik.values.senior_count,
		formik.values.student_count,
		formik.values.child_count,
		formik.values.additional_donation,
	]);

	return (
		<>
			<Navbar />

			<div className="min-h-screen bg-[#f4f7f2] py-12 px-4 flex justify-center items-center font-sans text-[#2c3623]">
				<div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-[#e2e8d5] overflow-hidden">
					{/* Header */}
					<div className="bg-[#b3c88a] relative p-10 text-center flex flex-col items-center gap-4">
						<div className="bg-white/90 p-2 rounded-full shadow-lg relative z-10">
							<img
								src="/logo.png"
								alt="logo"
								width={90}
								height={90}
							/>
						</div>
						<div className="relative z-10">
							<h1 className="text-3xl font-extrabold tracking-tight">
								Jhale Jhole Ombole
							</h1>
							<p className="text-[#2c3623]/80 font-medium uppercase tracking-widest text-xs">
								Event Registration
							</p>
						</div>
					</div>

					<form
						onSubmit={formik.handleSubmit}
						className="p-8 space-y-8">
						{/* Section 1: Personal Details */}
						<div>
							<h3 className="text-lg font-bold text-[#2c3623] flex items-center gap-2 mb-5">
								<span className="bg-[#e9f0df] text-[#5a6b38] p-2 rounded-lg">
									<Users size={20} />
								</span>
								Personal Details
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-sm font-semibold text-[#5a6b38]">
										Full Name
									</label>
									<input
										placeholder="John Doe"
										type="text"
										{...formik.getFieldProps("primary_guest_name")}
										className="h-11 w-full rounded-lg border border-[#d1dcc0] px-3 text-sm focus:ring-2 focus:ring-[#b3c88a]/30 outline-none"
									/>
									{formik.touched.primary_guest_name &&
										formik.errors.primary_guest_name && (
											<p className="text-red-500 text-xs mt-1">
												{formik.errors.primary_guest_name as string}
											</p>
										)}
								</div>
								<div className="space-y-2">
									<label className="text-sm font-semibold text-[#5a6b38]">
										Email Address
									</label>
									<input
										placeholder="johndoe@gmail.com"
										type="email"
										{...formik.getFieldProps("primary_guest_email")}
										className="h-11 w-full rounded-lg border border-[#d1dcc0] px-3 text-sm focus:ring-2 focus:ring-[#b3c88a]/30 outline-none"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-semibold text-[#5a6b38]">
										Phone Number
									</label>
									<input
										placeholder="1234567890"
										type="tel"
										{...formik.getFieldProps("primary_guest_ph")}
										className="h-11 w-full rounded-lg border border-[#d1dcc0] px-3 text-sm focus:ring-2 focus:ring-[#b3c88a]/30 outline-none"
									/>
								</div>
								<div className="space-y-2 flex flex-col">
									<label className="text-sm font-semibold text-[#5a6b38]">
										Registration Date
									</label>
									<Popover>
										<PopoverTrigger
											className="-mt-1"
											asChild>
											<Button
												variant="outline"
												className="w-full h-11 border-[#d1dcc0] justify-between font-normal">
												{formik.values.event_registration_date
													? format(formik.values.event_registration_date, "PPP")
													: "Pick a date"}
												<CalendarIcon className="h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0 border-[#b3c88a]">
											<Calendar
												mode="single"
												selected={formik.values.event_registration_date}
												onSelect={(d) =>
													formik.setFieldValue("event_registration_date", d)
												}
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</div>

						<div className="h-px bg-[#e2e8d5]" />

						{/* Section 2: Event Preferences & Counts */}
						<div>
							<h3 className="text-lg font-bold text-[#2c3623] flex items-center gap-2 mb-5">
								<span className="bg-[#e9f0df] text-[#5a6b38] p-2 rounded-lg">
									<Utensils size={20} />
								</span>
								Event Preferences
							</h3>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								{[
									{ id: "adult_count", label: "Adults" },
									{ id: "senior_count", label: "Seniors" },
									{ id: "student_count", label: "Students" },
									{ id: "child_count", label: "Children" },
								].map((item) => (
									<div
										key={item.id}
										className="space-y-1">
										<label className="text-xs font-bold uppercase text-[#5a6b38]">
											{item.label}
										</label>
										<input
											type="number"
											min="0"
											{...formik.getFieldProps(item.id)}
											className="h-11 w-full rounded-lg border border-[#d1dcc0] px-3 text-center text-sm focus:ring-2 focus:ring-[#b3c88a]/30"
										/>
									</div>
								))}
							</div>

							<div className="space-y-3">
								<label className="text-sm font-semibold text-[#5a6b38]">
									Food Preference
								</label>
								<div className="flex flex-wrap gap-4">
									{["Without", "Veg", "Non-Veg"].map((pref) => (
										<label
											key={pref}
											className={cn(
												"flex items-center space-x-2 cursor-pointer border rounded-lg p-3 transition-all flex-1",
												formik.values.food_preference === pref
													? "bg-[#eff5e6] border-[#b3c88a]"
													: "bg-white border-[#d1dcc0]",
											)}>
											<input
												type="radio"
												name="food_preference"
												value={pref}
												onChange={formik.handleChange}
												checked={formik.values.food_preference === pref}
												className="accent-[#b3c88a]"
											/>
											<span className="text-sm font-medium">{pref}</span>
										</label>
									))}
								</div>
							</div>
						</div>

						<div className="h-px bg-[#e2e8d5]" />

						{/* Section 3: Donation & Payment */}
						<div>
							<h3 className="text-lg font-bold text-[#2c3623] flex items-center gap-2 mb-5">
								<span className="bg-[#e9f0df] text-[#5a6b38] p-2 rounded-lg">
									<Heart size={20} />
								</span>
								Donation & Payment
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
								<div className="space-y-2">
									<label className="text-sm font-semibold text-[#5a6b38]">
										Donation Type
									</label>
									<Select
										onValueChange={(v) =>
											formik.setFieldValue("additional_donation_type", v)
										}
										defaultValue={formik.values.additional_donation_type}>
										<SelectTrigger className="h-11 border w-full border-[#d1dcc0]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="">
											<SelectItem value="General">General</SelectItem>
											<SelectItem value="Grand Patron">Grand Patron</SelectItem>
											<SelectItem value="Grand Donor">Grand Donor</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-semibold text-[#5a6b38]">
										Additional Donation ($)
									</label>
									<input
										placeholder="0.00"
										type="number"
										{...formik.getFieldProps("additional_donation")}
										className="h-11 w-full rounded-lg border border-[#d1dcc0] px-3 text-sm focus:ring-2 focus:ring-[#b3c88a]/30 outline-none"
									/>
								</div>
							</div>

							<div className="bg-[#f4f7f2] p-6 rounded-xl border-2 border-dashed border-[#b3c88a] flex flex-col md:flex-row justify-between items-center gap-6">
								<div>
									<p className="text-xs text-[#5a6b38] font-bold uppercase mb-1">
										Total Amount Due
									</p>
									<h2 className="text-4xl font-black text-[#2c3623]">
										${formik.values.total_amount.toFixed(2)}
									</h2>
								</div>
								<div className="flex gap-3 w-full md:w-auto">
									{["Zelle", "Paypal"].map((mode) => (
										<button
											key={mode}
											type="button"
											onClick={() =>
												formik.setFieldValue("payment_mode", mode.toLowerCase())
											}
											className={cn(
												"flex-1 md:px-6 h-12 rounded-lg text-sm font-bold transition-all",
												formik.values.payment_mode === mode.toLowerCase()
													? "bg-[#2c3623] text-white shadow-lg"
													: "bg-white border border-[#d1dcc0] text-[#5a6b38]",
											)}>
											{mode}
										</button>
									))}
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={!formik.isValid || formik.isSubmitting}
							className="w-full h-14 rounded-xl bg-[#b3c88a] hover:bg-[#a2b978] text-[#2c3623] text-lg font-black shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
							{formik.isSubmitting ? "Processing..." : "Complete Registration"}
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
