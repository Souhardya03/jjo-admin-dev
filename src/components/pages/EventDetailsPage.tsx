"use client"
import { format } from "date-fns";
import React, { useState } from "react";
import {
    Calendar,
    MapPin,
    ArrowRight,
    ChevronLeft,
    Info,
    Users,
    Loader2,
    Globe,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useGetSingleEventQuery } from "@/store/features/event-feature";
import RegistrationSidebar from "@/components/EventRegistrationForm";


export default function EventDetailsPage({props}: {props: {slug: string}}) {
    const { slug } = props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const {
        data: event_data,
        isLoading,
    } = useGetSingleEventQuery({
        event_slug: slug,
        current_date: new Date().toISOString().split('T')[0]
    });

    const event = event_data?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#b3c88a] mb-4" />
                <p className="text-gray-500 font-medium italic">Loading event details...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center">
                <p className="text-gray-500 font-medium">event not found.</p>
                <Link href="/events" className="text-[#b3c88a] font-bold mt-4">Return to events</Link>
            </div>
        );
    }

    const isOnline = event.event_mode === "Online";

    return (
        <div className="min-h-screen bg-[#fcfaf7] font-sans text-[#2c3623]">
            <nav className="max-w-6xl mx-auto px-6 py-8">
                <Link
                    href="/events"
                    className="flex items-center gap-2 text-sm font-bold text-[#b3c88a] hover:text-[#5a6b38] transition-colors group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to all events
                </Link>
            </nav>

            <main className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7 space-y-12">
                    <header className="space-y-6">
                        <Badge className="bg-[#b3c88a]/20 text-[#5a6b38] border-none px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                            {event.event_active_flg ? "Now Booking" : "Draft"}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                            {event.event_name}
                        </h1>
                        <div className="flex flex-wrap gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#eff5e6]">
                                    <Calendar className="w-5 h-5 text-[#b3c88a]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">event Date</p>
                                    <p className="font-bold">{format(new Date(event.event_date), "MMMM do, yyyy")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#eff5e6]">
                                    {isOnline ? <Globe className="w-5 h-5 text-[#b3c88a]" /> : <MapPin className="w-5 h-5 text-[#b3c88a]" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mode</p>
                                    <p className="font-bold">{isOnline ? "Virtual event" : `${event.event_venue_city}, ${event.event_venue_state}`}</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <section className="prose prose-sage max-w-none">
                        <h3 className="text-2xl font-black mb-4">About this experience</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Join us for <strong>{event.event_name}</strong>.
                            {isOnline ? (
                                " This is a virtual session accessible from anywhere. Link will be provided upon registration."
                            ) : (
                                ` Held at ${event.event_venue_address_ln1} ${event.event_venue_address_ln2 ? event.event_venue_address_ln2 : ""}.`
                            )}
                        </p>

                        {event.event_alt_date && (
                            <div className="mt-8 p-6 bg-white rounded-[2rem] border border-[#eff5e6] flex gap-4 items-start">
                                <Info className="w-6 h-6 text-[#b3c88a] shrink-0" />
                                <div>
                                    <p className="font-bold text-[#2c3623]">Contingency Schedule</p>
                                    <p className="text-sm text-gray-500">
                                        In case of unforeseen changes, the alternate date is set for: <strong>{format(new Date(event.event_alt_date), "PPP")}</strong>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section>
                        <h3 className="text-2xl font-black mb-6">{isOnline ? "Access Details" : "Venue Details"}</h3>
                        <Card className="border-none bg-white rounded-[2rem] p-8 shadow-sm">
                            {isOnline ? (
                                <div className="space-y-4">
                                    <p className="text-xl font-bold">Virtual Access</p>
                                    <p className="text-gray-500">The broadcast link is secured for registered attendees.</p>
                                    {event.event_broadcast_link && (
                                        <Badge variant="secondary" className="bg-[#fcfaf7] text-[#b3c88a] border-[#eff5e6]">
                                            <ExternalLink className="w-3 h-3 mr-2" /> Broadcast Enabled
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xl font-bold">{event.event_venue_address_ln1}</p>
                                    <p className="text-gray-500">{event.event_venue_address_ln2}</p>
                                    <p className="text-gray-500">
                                        {event.event_venue_city}, {event.event_venue_state} {event.event_venue_zip}
                                    </p>
                                    <Button variant="link" className="px-0 mt-4 text-[#b3c88a] font-bold">
                                        View on Map <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </section>
                </div>

                <div className="lg:col-span-5">
                    <div className="sticky top-12">
                        <Card className="border-none bg-[#2c3623] text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b3c88a]/20 rounded-full translate-x-10 -translate-y-10 blur-2xl" />
                            <div className="relative z-10 space-y-8">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b3c88a] mb-2">Available Plans</p>
                                    <h3 className="text-3xl font-black italic">Admission Rates</h3>
                                </div>

                                <div className="space-y-6">
                                    {event.rate_plans?.map((plan) => (
                                        <div key={plan.rate_plan_id} className="flex justify-between items-center border-b border-white/10 pb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-white/10 rounded-xl">
                                                    <Users className="w-4 h-4 text-[#b3c88a]" />
                                                </div>
                                                <div>

                                                    <span className="font-bold">{plan.rate_plan_name}</span>
                                                    <p className="text-xs">{plan.plan_details}</p>
                                                </div>
                                            </div>
                                            <span className="text-2xl font-black">${parseFloat(plan.rate_plan_cost).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">

                                    <Button onClick={() => setIsSidebarOpen(true)} className="w-full h-16 bg-[#b3c88a] hover:bg-[#c9db9d] text-[#2c3623] rounded-2xl text-xl font-black shadow-lg transition-transform active:scale-95">
                                        Reserve Your Spot
                                    </Button>

                                    <p className="text-center text-[10px] text-white/40 uppercase font-bold tracking-widest">Secure Checkout • No Hidden Fees</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
            <RegistrationSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                event={event}
            />
        </div>
    );
}