"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 1. Import usePathname
import {
	User,
	LayoutDashboard,
	Settings,
	LogOut,
	Menu,
	
	Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/store/baseApi";


import Cookies from 'js-cookie';
import Image from "next/image";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: userData, isLoading, refetch } = useGetProfileQuery();
	const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
	const user = userData?.data;
	const pathname = usePathname(); // 2. Get current path

	// --- ADMIN PROFILE COMPLETION STATE ---
	const [city, setCity] = useState("");
	const [phone, setphone] = useState("");
	const [countryCode, setCountryCode] = useState("+91");
	const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const isProfileIncomplete =
		user && (!user.phone || !user.city || !user.birthDate);

	// 3. Define Navigation Items
	const navItems = [
		{
			name: "Dashboard",
			href: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			name: "Events",
			href: "/dashboard/events",
			icon: User,
		},
		{
			name: "Settings",
			href: "/dashboard/settings",
			icon: Settings,
		},
		{
			name: "Email Templates",
			href: "/dashboard/email-templates",
			icon: Mail,
		},
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const finalPhone = phone ? `${countryCode} ${phone}` : user?.phone;
			await updateProfile({
				id: user?.id,
				city: city || user?.city,
				phone: finalPhone,
				birthDate: birthDate ? birthDate.toISOString() : user?.birthDate,
			}).unwrap();
			refetch();
			setCity("");
			setphone("");
			setCountryCode("+91");
			setBirthDate(undefined);
		} catch (error) {
			console.error("Failed to update profile", error);
		}
	};

	const handleLogout = async () => {
    try {
        Cookies.remove("auth-token");
        window.location.href = '/login'; 

    } catch (error) {
        console.error("Logout failed", error);
    }
};

	if (isLoading)
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
					<p className="text-gray-500 font-medium">Loading Workspace...</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50/50 font-sans text-slate-900 flex">
			{/* Mobile Sidebar Overlay */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-20 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 fixed h-full z-30 transition-transform duration-300 lg:translate-x-0",
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				)}>
				<div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
					<div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
						{/* <Users className="text-white w-6 h-6" /> */}
						<Image src={"/images/JJOLogo.png"} alt="jjo-logo" width={100} height={100}/>
					</div>
					<div>
						<h1 className="text-white font-bold text-lg tracking-tight">
							JJO Admin
						</h1>
						<p className="text-xs text-slate-500">Workspace</p>
					</div>
				</div>

				{/* 4. Mapped Navigation with Active Logic */}
				<nav className="flex-1 py-6 px-3 space-y-1">
					{navItems.map((item) => {
						const isActive = pathname === item.href;

						return (
							<Link
								key={item.href}
								href={item.href}>
								<Button
									variant="ghost"
									className={cn(
										"w-full justify-start transition-all duration-200",
										isActive
											? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border-r-2 border-indigo-500 rounded-r-none"
											: "text-slate-300 hover:bg-slate-800 hover:text-white"
									)}>
									<item.icon
										className={cn(
											"w-5 h-5 mr-3",
											isActive ? "text-indigo-400" : "text-slate-400"
										)}
									/>
									{item.name}
								</Button>
							</Link>
						);
					})}
				</nav>

				<div className="p-4 border-t border-slate-800/50">
					<div className="bg-slate-800/50 rounded-xl p-4 mb-2">
						<div className="flex items-center gap-3 mb-2">
							{user?.profileImage ? (
								<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
									<Image
										src={user.profileImage}
										alt=""
										height={40}
										width={40}
										className="h-full w-full object-contain rounded-full"
									/>
								</div>
							) : (
								<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
									{user?.name?.charAt(0) || "A"}
								</div>
							)}

							<div className="overflow-hidden">
								<p className="text-sm font-medium text-white truncate">
									{user?.name}
								</p>
								<p className="text-xs text-slate-500 truncate">Admin</p>
							</div>
						</div>
						<Button
							variant="ghost"
							onClick={handleLogout}
							size="sm"
							className="w-full justify-start text-xs text-slate-400  h-8">
							<LogOut className="w-3 h-3 mr-2" />
							Sign Out
						</Button>
					</div>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 lg:ml-64 relative flex flex-col min-h-screen">
				{/* Top Navigation */}
				<header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex justify-between items-center">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden text-gray-700"
							onClick={() => setIsSidebarOpen(true)}>
							<Menu className="w-6 h-6" />
						</Button>
						<div className="lg:hidden flex items-center gap-2">
							{/* Mobile Logo if needed */}
							<h1 className="font-bold text-gray-900">Admin</h1>
						</div>

						<div className="hidden lg:block">
							<h2 className="text-xl font-bold text-gray-900">Overview</h2>
							<p className="text-sm text-gray-500">
								Manage your event participants and communications.
							</p>
						</div>
					</div>

					{/* <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div> */}
				</header>

				{/* Render Page Content Here */}
				<div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
					{children}
				</div>
			</main>

			{/* BLOCKING MODAL - Profile Completion */}
			{/* <Dialog
        open={!!isProfileIncomplete}
        onOpenChange={() => {}}
        modal={true}
      >
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl"
        >
          <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30 relative z-10">
              <User className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white relative z-10">
              Complete Your Profile
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-2 relative z-10">
              We need a few more details to set up your admin account correctly.
            </DialogDescription>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
            {!user?.phone && (
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[110px] bg-slate-50 border-slate-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          <span className="flex items-center gap-2 text-base">
                            {item.flag} {item.code}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="123 456 7890"
                    value={phone}
                    onChange={(e) => setphone(e.target.value)}
                    className="flex-1 bg-slate-50 border-slate-200 h-11"
                    required
                  />
                </div>
              </div>
            )}

            {!user?.city && (
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter your city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="pl-10 bg-slate-50 border-slate-200 h-11"
                  />
                </div>
              </div>
            )}

            {!user?.birthDate && (
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Date of Birth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-50 border-slate-200 h-11",
                        !birthDate && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? (
                        format(birthDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      defaultMonth={birthDate || new Date(2000, 0)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold shadow-lg shadow-indigo-600/20 rounded-xl mt-2 transition-all hover:scale-[1.02]"
            >
              {isUpdating ? "Saving Profile..." : "Complete Setup"}
            </Button>
          </form>
        </DialogContent>
      </Dialog> */}
		</div>
	);
}
