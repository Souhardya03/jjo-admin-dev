"use client";
import React, { useEffect, useState } from "react";
import { useFormik, FormikProvider } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Users, ShieldCheck, CreditCard, Loader2, UserCheck, Utensils, Heart, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetMembersQuery } from "@/store/features/members";
import { useRegisterEventMutation } from "@/store/features/event-feature";
import { toast } from "sonner";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { log } from "console";

// --- Interfaces ---
interface SelectedPlan {
    rate_plan_id: string;
    rate_plan_name: string;
    count: number;
}

interface RegistrationFormValues {
    primary_guest_name: string;
    primary_guest_email: string;
    primary_guest_ph: string;
    primary_guest_address_street: string;
    primary_guest_address_city: string;
    primary_guest_address_state: string;
    primary_guest_address_zip: string;
    selected_plans: SelectedPlan[];
    veg_count: number;
    non_veg_count: number;
    additional_donation: number;
    additional_donation_type: string;
    payment_mode: string;
    total_amount: number;
    member_id: string | null;
}

const registrationSchema = z.object({
    primary_guest_name: z.string().min(2, "Required"),
    primary_guest_email: z.string().email("Invalid email"),
    primary_guest_ph: z.string().min(10, "Invalid phone"),
    primary_guest_address_street: z.string().min(1, "Street required"),
    primary_guest_address_city: z.string().min(1, "City required"),
    primary_guest_address_state: z.string().min(1, "State required"),
    primary_guest_address_zip: z.string().min(5, "Zip required"),
    selected_plans: z.array(z.any()).min(1, "Select at least one plan"),
    veg_count: z.number().min(0),
    non_veg_count: z.number().min(0),
    additional_donation: z.number().min(0).optional(),
    additional_donation_type: z.string().optional(),
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripeCheckout({ isProcessing, onConfirm }: { isProcessing: boolean, onConfirm: (s: any, e: any) => void }) {
        const stripe = useStripe();
        const elements = useElements();
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white p-4 rounded-xl border border-[#eaddc7]"><PaymentElement /></div>
                <Button
                    type="button"
                    disabled={isProcessing || !stripe}
                    onClick={() => onConfirm(stripe, elements)}
                    className="w-full h-12 bg-[#b3c88a] text-[#2c3623] hover:bg-[#c9db9d] rounded-xl font-black transition-all"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Pay & Register Now"}
                </Button>
            </div>
        );
    }


export default function RegistrationSidebar({ isOpen, onClose, event }: any) {
    const [isMember, setIsMember] = useState(false);
    const [emailSearch, setEmailSearch] = useState("");
    const [activeMethod, setActiveMethod] = useState<"stripe" | "paypal" | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingSecret, setLoadingSecret] = useState(false);

    const { data: memberData, isFetching: isSearching } = useGetMembersQuery(
        { search: emailSearch },
        { skip: !emailSearch || !z.string().email().safeParse(emailSearch).success }
    );

    const [registerEvent, { isLoading: isRegistering }] = useRegisterEventMutation();

    const formik = useFormik<RegistrationFormValues>({
        initialValues: {
            primary_guest_name: "",
            primary_guest_email: "",
            primary_guest_ph: "",
            primary_guest_address_street: "",
            primary_guest_address_city: "",
            primary_guest_address_state: "",
            primary_guest_address_zip: "",
            selected_plans: [],
            veg_count: 0,
            non_veg_count: 0,
            additional_donation: 0,
            additional_donation_type: "General",
            payment_mode: "",
            total_amount: 0,
            member_id: null
        },
        validationSchema: toFormikValidationSchema(registrationSchema),
        onSubmit: (values) => {
            const apiPayload = {
                ...values,
                event_id: event.event_id,
                is_member: isMember,
                event_reg_date: new Date().toISOString(),
            };
            toast.promise(registerEvent(apiPayload).unwrap(), {
                loading: "Registering...",
                success: (data: any) => {
                    onClose();
                    if (data?.success) {
                        formik.resetForm();
                    }
                    return data?.message || "Successfully registered!";
                },
                error: (e: any) => {
                    return e?.data?.message || e?.message || "Failed to register";
                }
            });
        },
    });

    // Handle Member Email Search
    useEffect(() => {
        const email = formik.values.primary_guest_email;
        if (z.string().email().safeParse(email).success) {
            setEmailSearch(email);
        } else {
            setIsMember(false);
            formik.setFieldValue("member_id", null);
        }
    }, [formik.values.primary_guest_email]);

    useEffect(() => {
        if (memberData?.members && memberData.members.length > 0) {
            const member = memberData.members[0];
            setIsMember(true);
            formik.setFieldValue("member_id", member.UUID);
            formik.setFieldValue("primary_guest_name", member.Name);
        } else if (!isSearching) {
            setIsMember(false);
            formik.setFieldValue("member_id", null);
        }
    }, [memberData, isSearching]);

    // Plan Toggle Logic
    const togglePlan = (plan: any, checked: boolean) => {
        const current = [...formik.values.selected_plans];
        if (checked) {
            current.push({
                rate_plan_id: plan.rate_plan_id,
                rate_plan_name: plan.rate_plan_name,
                count: 1,
            });
        } else {
            const index = current.findIndex((p) => p.rate_plan_id === plan.rate_plan_id);
            if (index > -1) current.splice(index, 1);
        }
        formik.setFieldValue("selected_plans", current);
    };

    const totalGuests = formik.values.selected_plans.reduce((acc, p) => acc + p.count, 0);

    // Calculate Total and Auto-Update
    useEffect(() => {
        let total = 0;
        formik.values.selected_plans.forEach(plan => {
            const masterRate = event?.rate_plans?.find((r: any) => r.rate_plan_id === plan.rate_plan_id);
            const cost = parseFloat(masterRate?.rate_plan_cost || "0");
            total += (plan.count) * cost;
        });
        total += (Number(formik.values.additional_donation) || 0);
        formik.setFieldValue("total_amount", total);
    }, [formik.values.selected_plans, formik.values.additional_donation, event]);


    
    const handlePaymentSuccess = async (transactionId: string) => {
        
        
        const apiPayload = {
            ...formik.values,
            event_id: event.event_id,
            is_member: isMember,
            transaction_id: transactionId,
            payment_mode: activeMethod,
            event_reg_date: new Date().toISOString(),
        };
        
        try {
            await registerEvent(apiPayload).unwrap();
            toast.success("Successfully registered for event!");
            formik.resetForm();
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "DB Sync failed. Please contact admin.");
        }
    };

    const handleStripeConfirm = async (stripe: any, elements: any) => {
        if (!stripe || !elements) return;
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
            confirmParams: { return_url: `${window.location.origin}/success` },
        });

        if (error) toast.error(error.message);
        else if (paymentIntent?.status === "succeeded") await handlePaymentSuccess(paymentIntent.id);
    };

    useEffect(() => {
        const fetchSecret = async () => {
            const amount = formik.values.total_amount;
            const email = formik.values.primary_guest_email;
            if (amount <= 0 || !z.string().email().safeParse(email).success || activeMethod !== "stripe") return;

            setLoadingSecret(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount, email }),
                });
                const data = await res.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                toast.error("Payment initialization failed.");
            } finally {
                setLoadingSecret(false);
            }
        };
        fetchSecret();
    }, [formik.values.total_amount, formik.values.primary_guest_email, activeMethod]);

    return (
        <PayPalScriptProvider options={{ "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "", currency: "USD" }}>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="w-full sm:max-w-[550px] overflow-y-auto bg-[#fdfbf7] p-0 border-l-[#eaddc7]">
                    <FormikProvider value={formik}>
                        <div className="p-8 space-y-10">
                            <SheetHeader>
                                <SheetTitle className="text-3xl font-black text-[#2c3623]">Registration Portal</SheetTitle>
                            </SheetHeader>

                            <form onSubmit={formik.handleSubmit} className="space-y-8 pb-12">
                                {/* Section 1: Personal Info */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#b49157]">1. Attendee Details</Label>
                                        {isSearching && <Loader2 className="w-3 h-3 animate-spin text-[#b49157]" />}
                                        {!isSearching && isMember && <Badge className="bg-emerald-100 text-emerald-700 border-none flex gap-1 items-center px-2 py-0.5 font-bold text-[10px] rounded"><UserCheck size={12} /> Member Verified</Badge>}
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Input placeholder="Email Address" {...formik.getFieldProps("primary_guest_email")} className={cn("rounded-xl transition-all", isMember && "border-emerald-500 bg-emerald-50")} />
                                        <Input placeholder="Full Name" {...formik.getFieldProps("primary_guest_name")} className="rounded-xl border-[#eaddc7]" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="Phone Number" {...formik.getFieldProps("primary_guest_ph")} className="rounded-xl border-[#eaddc7]" />
                                            <Input placeholder="Zip Code" {...formik.getFieldProps("primary_guest_address_zip")} className="rounded-xl border-[#eaddc7]" />
                                        </div>
                                        <Input placeholder="Street Address" {...formik.getFieldProps("primary_guest_address_street")} className="rounded-xl border-[#eaddc7]" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="City" {...formik.getFieldProps("primary_guest_address_city")} className="rounded-xl border-[#eaddc7]" />
                                            <Input placeholder="State" {...formik.getFieldProps("primary_guest_address_state")} className="rounded-xl border-[#eaddc7]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Rate Plan Selection */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#b49157]">2. Ticket Plans</Label>
                                    <div className="space-y-3">
                                        {event?.rate_plans?.map((plan: any) => {
                                            const planIndex = formik.values.selected_plans.findIndex(p => p.rate_plan_id === plan.rate_plan_id);
                                            const isSelected = planIndex > -1;
                                            const isAdultPlan = plan.rate_plan_name.toLowerCase().includes("adult");
                                            const isDisabled = plan.rate_plan_for_member && !isMember;

                                            if (isDisabled && !isSelected) return null;

                                            return (
                                                <Card key={plan.rate_plan_id} className={cn("p-5 border-[#eaddc7] transition-all", isSelected ? "bg-white border-[#b3c88a] shadow-sm" : "bg-transparent opacity-60")}>
                                                    <div className="flex items-center space-x-4">
                                                        <Checkbox id={plan.rate_plan_id} checked={isSelected} onCheckedChange={(checked) => togglePlan(plan, !!checked)} />
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex justify-between items-center">
                                                                <Label className="font-bold text-xl text-[#2c3623]">{plan.rate_plan_name}</Label>
                                                                {plan.rate_plan_for_member && <Badge className="bg-amber-100 text-amber-700 uppercase text-[9px] px-2 py-1 rounded font-bold">Member Only</Badge>}
                                                            </div>
                                                            <span className="text-[11px] text-[#b49157] font-bold">Price: ${plan.rate_plan_cost}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="mt-4 pt-4 border-t border-[#f4f1ea] flex items-center justify-between">
                                                            <Label className="text-xs font-bold text-gray-500 uppercase">{isAdultPlan ? "Adults" : "Children"}</Label>
                                                            <Input type="number" min="1" {...formik.getFieldProps(`selected_plans.${planIndex}.count`)} className="h-10 w-24 text-center rounded-xl border-[#b3c88a]" />
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Section 3: Food Preferences */}
                                <div className="space-y-4 pt-4 border-t border-[#eaddc7]">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#b49157]">3. Food & Diet ({totalGuests} Guests)</Label>
                                        {(formik.values.veg_count + formik.values.non_veg_count) > totalGuests && (
                                            <span className="text-[10px] text-red-500 font-bold uppercase animate-pulse">Meal count exceeds guests!</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-[#5a6b38] flex items-center gap-1.5"><Utensils size={14} /> Veg Count</Label>
                                            <Input type="number" min="0" {...formik.getFieldProps("veg_count")} className="rounded-xl border-[#eaddc7]" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-[#5a6b38] flex items-center gap-1.5"><Utensils size={14} /> Non-Veg Count</Label>
                                            <Input type="number" min="0" {...formik.getFieldProps("non_veg_count")} className="rounded-xl border-[#eaddc7]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Additional Donation (Optional) */}
                                <div className="space-y-4 pt-4 border-t border-[#eaddc7]">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#b49157]">4. Support the Event (Optional)</Label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-[#5a6b38] flex items-center gap-1.5"><Heart size={14} /> Donation Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0.00"
                                                    {...formik.getFieldProps("additional_donation")}
                                                    className="rounded-xl border-[#eaddc7] pl-7"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-[#5a6b38] flex items-center gap-1.5"><Info size={14} /> Type</Label>
                                            <Select
                                                value={formik.values.additional_donation_type}
                                                onValueChange={(v) => formik.setFieldValue("additional_donation_type", v)}
                                            >
                                                <SelectTrigger className="rounded-xl w-full border-[#eaddc7] h-10 font-bold text-xs bg-white">
                                                    <SelectValue placeholder="Select type" className="w-full" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-[#eaddc7] bg-white">
                                                    <SelectItem value="General" className="font-bold text-xs">General</SelectItem>
                                                    <SelectItem value="Food Fund" className="font-bold text-xs">Food Fund</SelectItem>
                                                    <SelectItem value="Decoration" className="font-bold text-xs">Decoration</SelectItem>
                                                    <SelectItem value="Venue" className="font-bold text-xs">Venue</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout Section */}
                                <div className="space-y-4 pt-4 border-t border-[#eaddc7]">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#b49157]">4. Payment Method</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setActiveMethod("stripe")} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all bg-white", activeMethod === "stripe" ? "border-[#b49157] shadow-md" : "border-[#eaddc7] opacity-60")}>
                                            <Image src="/logo/Stripe-Icon.svg" alt="Stripe" width={20} height={20} /> <span className="text-[10px] font-bold uppercase">Stripe</span>
                                        </button>
                                        <button type="button" onClick={() => setActiveMethod("paypal")} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all bg-white", activeMethod === "paypal" ? "border-[#0070ba] shadow-md" : "border-[#eaddc7] opacity-60")}>
                                            <Image src="/logo/Paypal-Icon.png" alt="PayPal" width={20} height={20} /> <span className="text-[10px] font-bold uppercase">PayPal</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Checkout Section */}
                                <div className="p-6 bg-[#2c3623] rounded-[2rem] text-white shadow-2xl space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-[#b3c88a] uppercase tracking-widest">Total to Pay</p>
                                            <h2 className="text-4xl font-black italic">${formik.values.total_amount.toFixed(2)}</h2>
                                        </div>
                                    </div>

                                    {activeMethod === "stripe" && (
                                        clientSecret ? (
                                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat', variables: { colorPrimary: '#b3c88a' } } }}>
                                                <StripeCheckout isProcessing={isRegistering} onConfirm={handleStripeConfirm} />
                                            </Elements>
                                        ) : (
                                            <div className="text-center p-4 border border-dashed border-white/20 rounded-xl">
                                                {loadingSecret ? <Loader2 className="animate-spin mx-auto text-[#b3c88a]" /> : <p className="text-[10px] uppercase font-bold text-white/60">Enter details to enable card payment</p>}
                                            </div>
                                        )
                                    )}

                                    {activeMethod === "paypal" && (
                                        <PayPalButtons
                                            style={{ layout: "vertical", color: "gold", shape: "rect", height: 45 }}
                                            createOrder={(data, actions) => actions.order.create({
                                                purchase_units: [{ amount: { currency_code: "USD", value: formik.values.total_amount.toString() } }],
                                                intent: "CAPTURE"
                                            })}
                                            onApprove={async (data, actions) => {
                                                const details = await actions.order?.capture();
                                                if (details) await handlePaymentSuccess(details.id || "");
                                            }}
                                        />
                                    )}

                                    {!activeMethod && (
                                        <Button className="w-full h-14 bg-white/10 text-white/40 cursor-not-allowed rounded-2xl font-black" disabled>
                                            Select Payment Method Above
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </FormikProvider>
                </SheetContent>
            </Sheet>
        </PayPalScriptProvider>
    );
}

const Badge = ({ children, className }: any) => <span className={cn("px-2 py-1 rounded text-[10px] font-bold", className)}>{children}</span>;