"use client"
import { format, parseISO } from "date-fns";
import React from "react";
import {
	Calendar,
	MapPin,
	Clock,
	ArrowRight,
	ChevronLeft,
	Info,
	ShieldCheck,
	Users,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useGeteventsQuery } from "@/store/features/event-feature";

// This data matches your provided JSON structure
const EVENT_DATA = {
	event_name: "Sky Watching 2026 testsfsf",
	event_slug: "sky-watching-2026-testsfsf-d671",
	event_date: "2026-03-03",
	event_alt_date: "2026-03-04",
	address_ln1: "JGEC Oval",
	address_ln2: "Near Main Building",
	city: "Jalpaiguri",
	state: "WB",
	zip: "735102",
	active_flag: "Y",
	event_id: "ff7bb331-665d-4e3b-8b59-20a5270ad8a0",
	rate_plan: {
		adult_amount: 500.0,
		child_amount: 300.0,
		rate_plan_name: "Alumni Standard Plan",
	},
};

export default  function EventDetailsPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = React.use(params);
    
	const {
		data: event_data,
		isLoading,
		error,
	} = useGeteventsQuery({ event_slug: slug, current_date: new Date().toISOString().split('T')[0] });
    const EVENT = event_data?.data || [] 

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center">
				<Loader2 className="w-10 h-10 animate-spin text-[#b3c88a] mb-4" />
				<p className="text-gray-500 font-medium italic">Loading event details...</p>
			</div>
		);
	}


	const eventDate = "2026-03-03";
	const altDate = "2026-03-04";

	return (
		<div className="min-h-screen bg-[#fcfaf7] font-sans text-[#2c3623]">
			{/* 1. Navigation / Back Button */}
			<nav className="max-w-6xl mx-auto px-6 py-8">
				<Link
					href="/events"
					className="flex items-center gap-2 text-sm font-bold text-[#b3c88a] hover:text-[#5a6b38] transition-colors group">
					<ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
					Back to all events
				</Link>
			</nav>

			<main className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
				{/* LEFT COLUMN: Content (8 cols) */}
				<div className="lg:col-span-7 space-y-12">
					{/* Hero Header */}
					<header className="space-y-6">
						<Badge className="bg-[#b3c88a]/20 text-[#5a6b38] hover:bg-[#b3c88a]/30 border-none px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
							Now Booking
						</Badge>
						<h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
							{EVENT_DATA.event_name}
						</h1>
						<div className="flex flex-wrap gap-8 pt-4">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-white rounded-2xl shadow-sm border border-[#eff5e6]">
									<Calendar className="w-5 h-5 text-[#b3c88a]" />
								</div>
								<div>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
										Event Date
									</p>
									<p className="font-bold">
										{format(eventDate, "MMMM do, yyyy")}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-3 bg-white rounded-2xl shadow-sm border border-[#eff5e6]">
									<MapPin className="w-5 h-5 text-[#b3c88a]" />
								</div>
								<div>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
										Location
									</p>
									<p className="font-bold">
										{EVENT_DATA.city}, {EVENT_DATA.state}
									</p>
								</div>
							</div>
						</div>
					</header>

					{/* Description */}
					<section className="prose prose-sage max-w-none">
						<h3 className="text-2xl font-black mb-4">About this experience</h3>
						<p className="text-gray-600 text-lg leading-relaxed">
							Experience the wonders of the night sky at the{" "}
							{EVENT_DATA.address_ln1}. Located {EVENT_DATA.address_ln2}, our
							sky watching session offers a pristine view of the cosmos. This
							event is part of the
							<strong> {EVENT_DATA.rate_plan.rate_plan_name}</strong>.
						</p>

						<div className="mt-8 p-6 bg-white rounded-[2rem] border border-[#eff5e6] flex gap-4 items-start">
							<Info className="w-6 h-6 text-[#b3c88a] shrink-0" />
							<div>
								<p className="font-bold text-[#2c3623]">Weather Contingency</p>
								<p className="text-sm text-gray-500">
									In case of heavy cloud cover, the event will be moved to our
									alternate date: <strong>{format(altDate, "PPP")}</strong>.
								</p>
							</div>
						</div>
					</section>

					{/* Location Details Card */}
					<section>
						<h3 className="text-2xl font-black mb-6">Venue Details</h3>
						<Card className="border-none bg-white rounded-[2rem] p-8 shadow-sm">
							<div className="space-y-2">
								<p className="text-xl font-bold">{EVENT_DATA.address_ln1}</p>
								<p className="text-gray-500">{EVENT_DATA.address_ln2}</p>
								<p className="text-gray-500">
									{EVENT_DATA.city}, {EVENT_DATA.state} {EVENT_DATA.zip}
								</p>
							</div>
							<Button
								variant="link"
								className="px-0 mt-4 text-[#b3c88a] font-bold hover:text-[#5a6b38]">
								View on Map <ArrowRight className="ml-2 w-4 h-4" />
							</Button>
						</Card>
					</section>
				</div>

				{/* RIGHT COLUMN: Ticket Card (5 cols) */}
				<div className="lg:col-span-5">
					<div className="sticky top-12">
						<Card className="border-none bg-[#2c3623] text-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
							{/* Decorative Circle */}
							<div className="absolute top-0 right-0 w-32 h-32 bg-[#b3c88a]/20 rounded-full translate-x-10 -translate-y-10 blur-2xl" />

							<div className="relative z-10 space-y-8">
								<div>
									<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b3c88a] mb-2">
										Pricing Tiers
									</p>
									<h3 className="text-3xl font-black italic">
										Admission Rates
									</h3>
								</div>

								<div className="space-y-6">
									<div className="flex justify-between items-center border-b border-white/10 pb-4">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-white/10 rounded-xl">
												<Users className="w-4 h-4 text-[#b3c88a]" />
											</div>
											<span className="font-bold">Adults & Seniors</span>
										</div>
										<span className="text-2xl font-black">
											${EVENT_DATA.rate_plan.adult_amount}
										</span>
									</div>
									<div className="flex justify-between items-center border-b border-white/10 pb-4">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-white/10 rounded-xl">
												<Users className="w-4 h-4 text-[#b3c88a]" />
											</div>
											<span className="font-bold">Children (Under 12)</span>
										</div>
										<span className="text-2xl font-black">
											${EVENT_DATA.rate_plan.child_amount}
										</span>
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-2 text-xs text-[#b3c88a] font-medium uppercase tracking-wider">
										<ShieldCheck className="w-4 h-4" />
										Secure Checkout
									</div>
									<Link
										href={`/register/${EVENT_DATA.event_slug}`}
										className="block">
										<Button className="w-full h-16 bg-[#b3c88a] hover:bg-[#c9db9d] text-[#2c3623] rounded-2xl text-xl font-black shadow-lg transition-transform active:scale-95">
											Reserve Your Spot
										</Button>
									</Link>
									<p className="text-center text-[10px] text-white/40 uppercase font-bold tracking-widest">
										No hidden fees • 100% Secure
									</p>
								</div>
							</div>
						</Card>

						{/* Sub-card info */}
						<div className="mt-8 px-6 text-center lg:text-left">
							<p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
								Need help?
							</p>
							<p className="text-sm text-gray-500 font-medium mt-1">
								Contact our event support at{" "}
								<span className="text-[#b3c88a] underline cursor-pointer">
									support@jjonj.org
								</span>
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
