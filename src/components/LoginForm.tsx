"use client";
import React, { useState, useRef, useEffect } from "react";
import {
	Mail,
	Lock,
	ArrowRight,
	ArrowLeft,
	Loader2,
	CheckCircle,
	Eye,
	EyeOff,
	LogIn,
	Key,
} from "lucide-react";

// Shadcn/UI Components
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
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useGoogleAuthQuery, useLoginMutation } from "@/store/baseApi";
import { toast } from "sonner";

// --- Custom OTP Input Component (Simulating Shadcn InputOTP) ---

interface OTPInputProps {
	length?: number;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
	length = 6,
	value,
	onChange,
	disabled,
}) => {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const handleChange = (
		index: number,
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const char = e.target.value;
		if (isNaN(Number(char))) return; // Only allow numbers

		const newOtp = value.split("");
		// Handle typing a single character
		if (char.length === 1) {
			newOtp[index] = char;
			onChange(newOtp.join(""));
			// Move to next input
			if (index < length - 1) {
				inputRefs.current[index + 1]?.focus();
			}
		}
		// Handle pasting (if the user pastes into one field)
		else if (char.length > 1) {
			const pastedData = char.slice(0, length).split("");
			for (let i = 0; i < length; i++) {
				newOtp[i] = pastedData[i] || "";
			}
			onChange(newOtp.join(""));
			// Focus the last filled input or the first empty one
			const nextIndex = Math.min(pastedData.length, length - 1);
			inputRefs.current[nextIndex]?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		// Handle Backspace
		if (e.key === "Backspace") {
			if (!value[index] && index > 0) {
				// If empty and backspacing, move to previous and clear it
				const newOtp = value.split("");
				newOtp[index - 1] = "";
				onChange(newOtp.join(""));
				inputRefs.current[index - 1]?.focus();
			} else {
				// Just clear current
				const newOtp = value.split("");
				newOtp[index] = "";
				onChange(newOtp.join(""));
			}
		}
	};

	// Initialize array if value is shorter than length
	useEffect(() => {
		if (value.length < length) {
			onChange(value.padEnd(length, " ").trim());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex items-center justify-center gap-2">
			{Array.from({ length }).map((_, index) => (
				<div
					key={index}
					className="relative">
					<Input
						ref={(el) => {
							inputRefs.current[index] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={index === 0 ? length : 1} // First input allows paste of full length
						value={value[index] || ""}
						onChange={(e) => handleChange(index, e)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						disabled={disabled}
						className={cn(
							"h-12 w-10 px-0 text-center text-lg font-bold transition-all",
							"focus:z-10 focus:ring-2 focus:ring-blue-500",
							value[index] && value[index] !== " "
								? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"
								: ""
						)}
					/>
					{/* Visual bottom bar to mimic slot style if desired */}
					{index === 2 && (
						<div className="absolute -right-1.5 top-1/2 -translate-y-1/2 text-gray-300">
							-
						</div>
					)}
				</div>
			))}
		</div>
	);
};

// --- Constants ---
const STEPS = {
	LOGIN: "LOGIN",
	EMAIL: "EMAIL",
	OTP: "OTP",
	RESET: "RESET",
	SUCCESS: "SUCCESS",
} as const;

type Step = (typeof STEPS)[keyof typeof STEPS];

export default function MemberAuthFlow() {
	const [currentStep, setCurrentStep] = useState<Step>(STEPS.LOGIN);
	const [isLoading, setIsLoading] = useState(false);

	// Login State
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");

	// Forgot Password State
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState(""); // String of 6 chars
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// UI State
	const [showPassword, setShowPassword] = useState(false);

	// Api
	const { data: googleAuthData } = useGoogleAuthQuery({});
	const [
		login,
		{ error: loginError, isError: isLoginError, isLoading: isLoginLoading },
	] = useLoginMutation();

	// --- Handlers ---

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const res = await login({
				email: loginEmail,
				password: loginPassword,
			}).unwrap();
			console.log(res);
			
			if (res.success) {
				localStorage.setItem("auth-token", res.token);
				document.cookie = `auth-token=${res.token}; path=/; secure; samesite=lax`;
				window.location.href = "/";
			}
		} catch (error) {
			console.log(error);
			toast.error("Invalid Credentials");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendOtp = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setTimeout(() => {
			console.log(`OTP sent to ${email}`);
			setIsLoading(false);
			setCurrentStep(STEPS.OTP);
		}, 1500);
	};

	const handleVerifyOtp = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setTimeout(() => {
			if (otp.replace(/\s/g, "") === "123456") {
				console.log("OTP Verified");
				setIsLoading(false);
				setCurrentStep(STEPS.RESET);
			} else {
				setIsLoading(false);
				alert("Invalid OTP (Try 123456)");
			}
		}, 1500);
	};

	const handleResetPassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}
		setIsLoading(true);
		setTimeout(() => {
			console.log("Password Reset Successfully");
			setIsLoading(false);
			setCurrentStep(STEPS.SUCCESS);
		}, 1500);
	};

	const handleGoogleLogin = async () => {
		console.log("hello");

		const res = googleAuthData;
		window.location.href = res?.url || "";
		console.log(res);
	};

	const switchFlow = (targetStep: Step) => {
		// Reset states when switching main flows if needed
		setCurrentStep(targetStep);
	};

	// --- Render Steps ---

	const renderContent = () => {
		switch (currentStep) {
			// -----------------------------------------------------------------------
			// 1. LOGIN VIEW
			// -----------------------------------------------------------------------
			case STEPS.LOGIN:
				return (
					<form
						onSubmit={handleLogin}
						className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="loginEmail">Email Address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									id="loginEmail"
									placeholder="name@example.com"
									type="email"
									value={loginEmail}
									onChange={(e) => setLoginEmail(e.target.value)}
									required
									className="pl-10"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="loginPassword">Password</Label>
								<button
									type="button"
									onClick={() => switchFlow(STEPS.EMAIL)}
									className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400">
									Forgot password?
								</button>
							</div>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									id="loginPassword"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									value={loginPassword}
									onChange={(e) => setLoginPassword(e.target.value)}
									required
									className="pl-10 pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-gray-400 hover:bg-transparent">
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700"
							disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
									In...
								</>
							) : (
								<>
									<LogIn className="mr-2 h-4 w-4" /> Sign In
								</>
							)}
						</Button>

						{/* Social / Alternative (Optional) */}
						<div className="relative my-4">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-gray-300 dark:border-gray-700" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-2 text-gray-500 dark:bg-gray-900">
									Or continue with
								</span>
							</div>
						</div>
						<Button
							variant="outline"
							type="button"
							className="w-full gap-2 dark:bg-zinc-800"
							onClick={() => handleGoogleLogin()}>
							<Image
								src="/logo/google.png"
								alt="G"
								width={16}
								height={16}
							/>{" "}
							Google
						</Button>
					</form>
				);

			// -----------------------------------------------------------------------
			// 2. FORGOT PASSWORD: EMAIL INPUT
			// -----------------------------------------------------------------------
			case STEPS.EMAIL:
				return (
					<form
						onSubmit={handleSendOtp}
						className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									id="email"
									placeholder="name@example.com"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="pl-10"
								/>
							</div>
						</div>
						<Button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700"
							disabled={isLoading}>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<span className="flex items-center">
									Send Reset Code <ArrowRight className="ml-2 h-4 w-4" />
								</span>
							)}
						</Button>
					</form>
				);

			// -----------------------------------------------------------------------
			// 3. FORGOT PASSWORD: OTP INPUT
			// -----------------------------------------------------------------------
			case STEPS.OTP:
				return (
					<form
						onSubmit={handleVerifyOtp}
						className="space-y-6">
						<div className="space-y-4">
							<div className="text-center">
								<Label
									htmlFor="otp"
									className="sr-only">
									Enter verification code
								</Label>
								<div className="mb-2 flex justify-center">
									<div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
										<Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									We sent a 6-digit code to{" "}
									<span className="font-medium text-foreground">{email}</span>
								</p>
							</div>

							{/* Custom Shadcn-style OTP Input */}
							<OTPInput
								length={6}
								value={otp}
								onChange={setOtp}
								disabled={isLoading}
							/>
						</div>

						<Button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700"
							disabled={isLoading || otp.replace(/\s/g, "").length < 6}>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								"Verify Code"
							)}
						</Button>

						<div className="text-center">
							<button
								type="button"
								onClick={() => alert("Resending code...")}
								className="text-sm text-blue-600 hover:underline dark:text-blue-400">
								Didn&apos;t receive code? Resend
							</button>
						</div>
					</form>
				);

			// -----------------------------------------------------------------------
			// 4. FORGOT PASSWORD: RESET
			// -----------------------------------------------------------------------
			case STEPS.RESET:
				return (
					<form
						onSubmit={handleResetPassword}
						className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="newPassword">New Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									id="newPassword"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
									className="pl-10 pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-gray-400 hover:bg-transparent">
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									id="confirmPassword"
									type="password"
									placeholder="••••••••"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									className="pl-10"
								/>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700"
							disabled={isLoading}>
							{isLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								"Reset Password"
							)}
						</Button>
					</form>
				);

			// -----------------------------------------------------------------------
			// 5. SUCCESS
			// -----------------------------------------------------------------------
			case STEPS.SUCCESS:
				return (
					<div className="flex flex-col items-center justify-center space-y-4 py-4">
						<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
							<CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
						</div>
						<div className="text-center space-y-1">
							<h3 className="text-lg font-medium">Password Reset Complete</h3>
							<p className="text-sm text-muted-foreground">
								Your password has been successfully updated. You can now log in.
							</p>
						</div>
						<Button
							onClick={() => switchFlow(STEPS.LOGIN)}
							className="w-full bg-blue-600 hover:bg-blue-700">
							Back to Login
						</Button>
					</div>
				);

			default:
				return null;
		}
	};

	// --- Dynamic Header Text ---
	const getHeaderText = () => {
		switch (currentStep) {
			case STEPS.LOGIN:
				return {
					title: "Welcome Back",
					desc: "Enter your email and password to access your account",
				};
			case STEPS.EMAIL:
				return {
					title: "Forgot Password?",
					desc: "No worries, we'll send you reset instructions.",
				};
			case STEPS.OTP:
				return { title: "Authentication Required", desc: null };
			case STEPS.RESET:
				return {
					title: "Reset Password",
					desc: "Choose a strong password for your account.",
				};
			case STEPS.SUCCESS:
				return { title: "All Done!", desc: "" };
			default:
				return { title: "", desc: "" };
		}
	};

	const headerText = getHeaderText();

	return (
		<Card className="w-full lg:max-w-lg md:max-w-xl shadow-2xl dark:shadow-neutral-700/50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-300">
			<CardHeader className="text-center space-y-1">
				<div className="flex items-center justify-center relative">
					{/* Back Button (Show only in Forgot Password sub-flows) */}
					{(currentStep === STEPS.EMAIL ||
						currentStep === STEPS.OTP ||
						currentStep === STEPS.RESET) && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute left-0 top-0 h-8 w-8 text-gray-500"
							onClick={() => {
								if (currentStep === STEPS.EMAIL) switchFlow(STEPS.LOGIN);
								else if (currentStep === STEPS.OTP) switchFlow(STEPS.EMAIL);
								else if (currentStep === STEPS.RESET) switchFlow(STEPS.OTP);
							}}>
							<ArrowLeft className="h-4 w-4" />
						</Button>
					)}
					<CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
						{headerText.title}
					</CardTitle>
				</div>
				{headerText.desc && (
					<CardDescription>{headerText.desc}</CardDescription>
				)}
			</CardHeader>

			<CardContent>{renderContent()}</CardContent>

			{/* Footer: Signup Link (Visible only on Login Page) */}
			{currentStep === STEPS.LOGIN && (
				<CardFooter className="flex justify-center border-t p-4 pt-6">
					<div className="text-center text-sm text-gray-500 dark:text-gray-400">
						Don&apos;t have an account?{" "}
						<Link
							href={"/register"}
							className="font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400">
							Sign up
						</Link>
					</div>
				</CardFooter>
			)}

			{/* Footer: Return to Login (Visible on Forgot Password sub-pages) */}
			{currentStep === STEPS.EMAIL && (
				<CardFooter className="flex justify-center border-t p-4 pt-6">
					<button
						onClick={() => switchFlow(STEPS.LOGIN)}
						className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
						<ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
					</button>
				</CardFooter>
			)}
		</Card>
	);
}
