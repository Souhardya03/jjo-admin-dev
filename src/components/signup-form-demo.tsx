"use client";
import React, { useState, useEffect } from "react";
// Lucide icons: added Mail, Phone, Lock, Eye, EyeOff, MapPin
import {
	User,
	Camera,
	Calendar as CalendarIcon,
	LucideCheckCircle,
	Loader2,
	Mail,
	Phone,
	Lock,
	Eye,
	EyeOff,
	MapPin,
} from "lucide-react";
import { format } from "date-fns";

// Shadcn/UI Components (assuming these base components are available via imports)
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"; // Assuming cn utility is available
import Image from "next/image";
import { useGoogleAuthQuery } from "@/store/baseApi";

// ----------------------------------------------------------------------
// 1. STANDALONE DATE PICKER COMPONENT
// ----------------------------------------------------------------------

interface DatePickerProps {
	id: string;
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
	placeholder: string;
}

function DatePicker({ id, value, onChange, placeholder }: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant={"outline"}
					className={cn(
						"w-full justify-start text-left font-normal",
						!value && "text-muted-foreground"
					)}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? format(value, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				align="start">
				<Calendar
					mode="single"
					selected={value}
					onSelect={onChange}
					initialFocus
					captionLayout="dropdown"
					fromYear={1900}
					toYear={new Date().getFullYear()}
				/>
			</PopoverContent>
		</Popover>
	);
}

// ----------------------------------------------------------------------
// 2. MAIN SIGNUP FORM COMPONENT
// ----------------------------------------------------------------------

interface MemberSignupData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	password: string;
	profileImageFile: File | null;
	profileImagePreview: string | null;
}

export default function MemberSignupForm() {
	const [formData, setFormData] = useState<MemberSignupData>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		profileImageFile: null,
		profileImagePreview: null,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	// State for password visibility toggle
	const [showPassword, setShowPassword] = useState(false);

	// Cleanup function for the temporary URL created by createObjectURL
	useEffect(() => {
		return () => {
			if (formData.profileImagePreview) {
				URL.revokeObjectURL(formData.profileImagePreview);
			}
		};
	}, [formData.profileImagePreview]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	const handleDateChange = (date: Date | undefined) => {
		setFormData((prev) => ({ ...prev, birthDate: date }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;

		if (formData.profileImagePreview) {
			URL.revokeObjectURL(formData.profileImagePreview);
		}

		if (file) {
			const previewUrl = URL.createObjectURL(file);
			setFormData((prev) => ({
				...prev,
				profileImageFile: file,
				profileImagePreview: previewUrl,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				profileImageFile: null,
				profileImagePreview: null,
			}));
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitSuccess(false);

		// --- Simulated API Submission ---
		setTimeout(() => {
			const finalData = {
				name: `${formData.firstName} ${formData.lastName}`.trim(),
				email: formData.email,
				phone: formData.phone || null,
				password: formData.password,

				profileImageFileName: formData.profileImageFile?.name || null,
			};

			console.log("Submitting Member Data:", finalData);

			setIsSubmitting(false);
			setSubmitSuccess(true);
			// Reset form after a brief delay if successful (optional)
			// setTimeout(() => { /* Reset logic */ }, 2000);
		}, 1500); // Simulate network delay
	};

	const { data: googleAuthData } = useGoogleAuthQuery({});

	const handleGoogleLogin = async () => {
		console.log("hello");

		const res = googleAuthData;
		window.location.href = res?.url || "";
		console.log(res);
	};

	return (
		<Card className="w-full lg:max-w-xl md:max-w-2xl shadow-2xl dark:shadow-neutral-700/50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
			<CardHeader className="text-center">
				<CardTitle className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
					Join the Community
				</CardTitle>
				<CardDescription>
					Create your member account to access events and volunteer
					opportunities.
				</CardDescription>
			</CardHeader>

			<CardContent>
				{/* Replaced ScrollArea with a custom scrolling div for compilation robustness */}
				<div className="lg:max-h-112 overflow-y-auto pr-4">
					<form onSubmit={handleSubmit}>
						<div className="grid w-full items-center gap-4">
							{/* Profile Photo Input & Preview */}
							<div className="flex flex-col items-center justify-center space-y-3 p-4 border rounded-xl border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800/50">
								<Label
									htmlFor="profileImage"
									className="cursor-pointer flex items-center justify-center flex-col text-center">
									{/* Image Preview Area */}
									<div className="relative h-28 w-28 rounded-full border-4 border-blue-500 dark:border-blue-700 overflow-hidden group hover:opacity-80 transition-opacity transform hover:scale-105 duration-300">
										{formData.profileImagePreview ? (
											<img
												src={formData.profileImagePreview}
												alt="Profile Preview"
												className="h-full w-full object-cover"
												aria-label="Profile Image Preview"
											/>
										) : (
											// Default Placeholder
											<div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-400">
												<User className="w-12 h-12" />
											</div>
										)}
										{/* Camera Overlay */}
										<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
											<Camera className="w-6 h-6 text-white" />
										</div>
									</div>
									<p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
										{formData.profileImageFile
											? "Change Photo"
											: "Upload Profile Photo (Optional)"}
									</p>
								</Label>
								<Input
									id="profileImage"
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="hidden" // Hide the default input, triggered by the Label/Image circle
								/>
							</div>

							{/* Name Fields with Icons */}
							<div className="flex flex-col space-y-1.5 md:flex-row md:space-y-0 md:space-x-4">
								<div className="flex flex-col space-y-1.5 w-full">
									<Label htmlFor="firstName">First Name</Label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
										<Input
											id="firstName"
											placeholder="Jane"
											type="text"
											value={formData.firstName}
											onChange={handleInputChange}
											required
											className="pl-10"
										/>
									</div>
								</div>
								<div className="flex flex-col space-y-1.5 w-full">
									<Label htmlFor="lastName">Last Name</Label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
										<Input
											id="lastName"
											placeholder="Doe"
											type="text"
											value={formData.lastName}
											onChange={handleInputChange}
											required
											className="pl-10"
										/>
									</div>
								</div>
							</div>

							{/* Email with Icon */}
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="email">Email Address</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
									<Input
										id="email"
										placeholder="you@example.com"
										type="email"
										value={formData.email}
										onChange={handleInputChange}
										required
										className="pl-10"
									/>
								</div>
							</div>

							{/* Password with Icon and Toggle */}
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
									<Input
										id="password"
										placeholder="••••••••"
										// Toggle input type based on state
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={handleInputChange}
										required
										className="pr-10 pl-10" // Padding on both sides for icons
									/>
									{/* Visibility Toggle Button */}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-gray-400 hover:bg-transparent hover:text-gray-600 dark:hover:text-gray-300">
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							{/* Birth Date (Date Picker) and Phone with Icon */}
							<div className="flex flex-col space-y-1.5 md:flex-row md:space-y-0 md:space-x-4">
								{/* <div className="flex flex-col space-y-2 w-full">
									<Label htmlFor="birthDate">Birth Date (Optional)</Label>
									<DatePicker
										id="birthDate"
										value={formData.birthDate}
										onChange={handleDateChange}
										placeholder="Pick your birth date"
									/>
								</div> */}
								<div className="flex flex-col space-y-1.5 w-full">
									<Label htmlFor="phone">Phone (Optional)</Label>
									<div className="relative">
										<Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
										<Input
											id="phone"
											placeholder="(555) 123-4567"
											type="tel"
											value={formData.phone}
											onChange={handleInputChange}
											className="pl-10"
										/>
									</div>
								</div>
							</div>

							{/* City Field with Icon */}
							{/* <div className="flex flex-col space-y-1.5">
								<Label htmlFor="city">City (Optional)</Label>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
									<Input
										id="city"
										placeholder="New York"
										type="text"
										value={formData.city}
										onChange={handleInputChange}
										className="pl-10"
									/>
								</div>
							</div> */}

							{/* Submit Button */}
							<Button
								type="submit"
								disabled={isSubmitting || submitSuccess}
								className="mt-6 w-full text-lg font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700">
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : submitSuccess ? (
									<>
										<LucideCheckCircle className="mr-2 h-4 w-4" />
										Success!
									</>
								) : (
									"Create Account"
								)}
							</Button>
						</div>
					</form>
				</div>
			</CardContent>

			<CardFooter className="flex flex-col gap-4">
				{/* Separator */}
				<div className="relative w-full">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-gray-300 dark:border-gray-700" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
							OR
						</span>
					</div>
				</div>

				{/* Google Login Button */}
				<Button
					variant="outline"
					className="w-full text-base flex items-center gap-2 dark:bg-zinc-800 dark:hover:bg-zinc-700"
					onClick={() => handleGoogleLogin()}>
					<Image
						src={"/logo/google.png"}
						alt="google logo"
						width={20}
						height={20}
					/>
					Sign up with Google
				</Button>
			</CardFooter>
		</Card>
	);
}
