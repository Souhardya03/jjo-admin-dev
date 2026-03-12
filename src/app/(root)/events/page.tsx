"use client";

import { format, parseISO } from "date-fns";
import {
	Calendar,
	MapPin,
	ChevronRight,
	Search,
	CalendarHeart,
	UserLock,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useGeteventsQuery } from "@/store/features/event-feature";
import { useState } from "react";



export default function EventsListing() {
	const [searchEvent, setSearchEvent] = useState<string>("");
	const { data: event_data, isLoading, error } = useGeteventsQuery({ limit: 1000, search: searchEvent });
	const events = Array.isArray(event_data?.data) ? event_data?.data : (event_data?.data ? [event_data?.data] : []);

	return (
		<>
			<Navbar />

			<div className="min-h-screen bg-[#fcfaf7] py-16 px-6 font-sans">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<header className="mb-16 space-y-4">
						<div className="flex items-center gap-2 text-[#b3c88a] font-bold tracking-widest text-sm uppercase">
							<div className="h-px w-8 bg-[#b3c88a]" />
							Experiences
						</div>
						<h1 className="text-5xl font-black text-[#2c3623]">
							Upcoming Events
						</h1>

						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
							<p className="text-gray-500 max-w-md">
								Select an event below to view details and secure your
								participation.
							</p>
							<div className="relative w-full md:w-80">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
								<input
									value={searchEvent}
									onChange={(e) => setSearchEvent(e.target.value)}
									placeholder="Find an event..."
									className="w-full h-11 pl-10 pr-4 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#b3c88a]/30 transition-all shadow-sm"
								/>
							</div>
						</div>
					</header>

					{/* Grid Layout */}
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-20">
							<Loader2 className="w-10 h-10 animate-spin text-[#b3c88a] mb-4" />
							<p className="text-gray-500 font-medium italic">
								Gathering upcoming experiences...
							</p>
						</div>
					) : events.length === 0 ? (
						<div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
							<CalendarHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
							<h3 className="text-xl font-bold text-[#2c3623]">
								No events found
							</h3>
							<p className="text-gray-500 mt-2">
								We couldn't find any events matching your criteria.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
							{events.map((event) => (
								<Card
									key={event.event_id}
									className="group relative border-none bg-white rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden">
									{/* Top Section: Date & Status */}
									<div className="flex justify-between items-start mb-8">
										<div className="bg-[#f4f7f2] rounded-2xl p-3 text-center min-w-[60px] border border-[#eff5e6]">
											<p className="text-[10px] font-bold text-[#b3c88a] uppercase">
												{format(parseISO(event.event_date), "MMM")}
											</p>
											<p className="text-xl font-black text-[#2c3623]">
												{format(parseISO(event.event_date), "dd")}
											</p>
										</div>
										{event.event_active_flg === true ? (
											<Badge className="bg-[#b3c88a]/20 text-[#5a6b38] hover:bg-[#b3c88a]/30 border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
												Active
											</Badge>
										) : (
											<Badge
												variant="secondary"
												className="px-4 py-1 rounded-full text-[10px] font-bold uppercase">
												Inactive
											</Badge>
										)}
									</div>

									{/* Middle Section: Info */}
									<div className="space-y-4 mb-10">
										<h3 className="text-2xl font-black text-[#2c3623] leading-tight group-hover:text-[#5a6b38] transition-colors">
											{event.event_name}
										</h3>
										<div className="flex items-start gap-2 text-gray-500 text-sm">
											<div className="p-1.5 bg-[#fcfaf7] rounded-lg">
												<MapPin className="w-4 h-4 text-[#b3c88a]" />
											</div>
											<span className="font-medium">
												{event.event_mode === "Online" ? (
													<span className="flex flex-col items-center gap-2">
														Virtual Event
														{event.event_broadcast_link && (
															<span className="text-[10px] bg-[#f0f4e8] text-[#5a6b38] px-2 py-0.5 rounded-full uppercase font-bold">
																Live Stream
															</span>
														)}
													</span>
												) : (
													<>
														{event.event_venue_city}
														{(event.event_venue_address_ln1 || event.event_venue_address_ln2) &&
															`, ${[event.event_venue_address_ln1, event.event_venue_address_ln2].filter(Boolean).join(", ")}`
														}
													</>
												)}
											</span>
										</div>
									</div>

									{/* Bottom Section: Action */}
									<div className="flex items-center z-20 justify-between pt-4 border-t border-gray-50">
										<span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
											View Details
										</span>
										<Link href={`/events/${event.event_slug}`}>
											<Button
												size="icon"
												className="rounded-full z-20 cursor-pointer bg-[#2c3623] hover:bg-[#b3c88a] text-white transition-all transform group-hover:scale-110 duration-300">
												<ChevronRight className="w-5 h-5" />
											</Button>
										</Link>
									</div>

									{/* Decorative background element */}
									<div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#b3c88a]/5 rounded-full group-hover:scale-150 z-10 transition-transform duration-700" />
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}

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
