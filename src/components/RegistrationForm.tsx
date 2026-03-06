"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    CalendarIcon, X, DollarSign, Wallet, CreditCard, MapPin, Users,
    Info, Loader2, Award, UserLock, CalendarHeart, Home, Ticket, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- STRIPE ---
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegisterMembersMutation, useVerifyInviteCodeMutation } from "@/store/features/members";
import Image from "next/image";
import { useGetTemplatesQuery, useSendEmailMutation } from "@/store/features/email-template";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- VALIDATION SCHEMA ---
const familyMemberSchema = z.object({
    Name: z.string().min(2, "Required"),
    Gender: z.string().min(1, "Required"),
    DOB: z.date({ message: "Invalid date" }).optional(),
    Email: z.string().email("Invalid email").optional().or(z.literal("")),
    Activity: z.string().min(1, "Required"),
    OtherActivity: z.string().optional(),
    SameAddress: z.boolean().optional(),
    Street: z.string().optional(),
    City: z.string().optional(),
    State: z.string().optional(),
    Zip: z.string().optional(),
});

const schema = z.object({
    Name: z.string().min(2, "Full Name is required"),
    Gender: z.string().min(1, "Required"),
    EmailAddress: z.string().email("Invalid email"),
    PhoneNo: z.string().min(10, "Invalid phone"),
    DOB: z.date({ message: "DOB required" }),
    Invite_Code: z.string().length(6, "Invite code must be 6 characters"),
    Activity: z.string().min(1, "Required"),
    OtherActivity: z.string().optional(),
    Street: z.string().min(1, "Street required"),
    City: z.string().min(1, "City required"),
    State: z.string().min(1, "State required"),
    Zip: z.string().min(5, "Zip required"),
    PaymentMethod: z.enum(["Zelle", "PayPal"]),
    Amount: z.string().min(1, "Amount required"),
    TransactionDate: z.date({ message: "Date required" }),
    familyMembers: z.array(familyMemberSchema),
});
type RegisterFormData = z.infer<typeof schema>;

const FormError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <p className="text-red-500 text-[10px] italic mt-1">{message}</p>;
};

function StripeSubmitSection({ isProcessing, onConfirm }: { isProcessing: boolean, onConfirm: (s: any, e: any) => void }) {
    const stripe = useStripe();
    const elements = useElements();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#eaddc7] animate-in fade-in zoom-in-95 duration-500">
                <PaymentElement />
            </div>
            <Button
                type="button"
                disabled={isProcessing || !stripe}
                onClick={() => onConfirm(stripe, elements)}
                className="w-full h-16 bg-[#2d2a26] hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
            >
                {isProcessing ? (
                    <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-[#b49157]" /> PROCESSING...</span>
                ) : (
                    "Complete Enrolment & Pay"
                )}
            </Button>
        </div>
    );
}

export default function RegistrationForm() {
    const [isLoopingCreation, setIsLoopingCreation] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingSecret, setLoadingSecret] = useState(false);

    const [addMembers] = useRegisterMembersMutation();
    const [sendEmail] = useSendEmailMutation();
    const [verifyInviteCode,{isError:isVerifyInviteCodeError,error:verifyInviteCodeError}] = useVerifyInviteCodeMutation();
    const { data: getEmailTemplate } = useGetTemplatesQuery({ search: "Welcome Mail" });
    const email_template = getEmailTemplate?.data[0];

    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(schema),
        defaultValues: { PaymentMethod: "Zelle", familyMembers: [], TransactionDate: new Date() },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "familyMembers" });
    const primaryActivity = watch("Activity");
    const familyMembersWatch = watch("familyMembers");
    const watchAmount = watch("Amount");
    const watchEmail = watch("EmailAddress");

    useEffect(() => {
        const fetchSecret = async () => {
            if (!watchAmount || !watchEmail || parseFloat(watchAmount) <= 0) return;
            setLoadingSecret(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: watchAmount,
                        email: watchEmail
                    }),
                });
                const data = await res.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                toast.error("Stripe initialization failed.");
            } finally {
                setLoadingSecret(false);
            }
        };

        if(isVerifyInviteCodeError){
            toast.error((verifyInviteCodeError as any).data?.message);
        }

        const timer = setTimeout(fetchSecret, 1200);
        return () => clearTimeout(timer);
    }, [watchAmount, watchEmail, isVerifyInviteCodeError, verifyInviteCodeError]);

    const handleFinalSubmit = async (stripe: any, elements: any) => {
        if (!stripe || !elements || isLoopingCreation) return;

        const values = watch();
        if (!values.Name || !values.EmailAddress || !values.Amount) {
            toast.error("Please fill in all required profile fields first.");
            return;
        }

        setIsLoopingCreation(true);
        try {

            // Verify invite code
            const verifyCodeRes = await verifyInviteCode({ code: values.Invite_Code }).unwrap();
            if (!verifyCodeRes.success) {
                toast.error(verifyCodeRes.message);
                setIsLoopingCreation(false);
                return;
            }

            const { paymentIntent: currentIntent } = await stripe.retrievePaymentIntent(clientSecret);

            let paymentStatus = currentIntent?.status;

            if (paymentStatus !== "succeeded") {
                const { error, paymentIntent: confirmedIntent } = await stripe.confirmPayment({
                    elements,
                    redirect: "if_required",
                    confirmParams: {
                        return_url: `${window.location.origin}/success`,
                        payment_method_data: { billing_details: { name: values.Name, email: values.EmailAddress } },
                    },
                });

                if (error) {
                    toast.error(error.message || "Payment Failed");
                    setIsLoopingCreation(false);
                    return;
                }
                paymentStatus = confirmedIntent?.status;
            }

            if (paymentStatus === "succeeded") {
                const primaryRes = await addMembers({
                    ...values,
                    TransactionId: currentIntent?.id || "",
                    Activity: values.Activity === "Other" ? values.OtherActivity : values.Activity
                }).unwrap();

                if (primaryRes?.success) {
                    const familyId = primaryRes.FamilyId;
                    const primaryUUID = primaryRes.UUID;

                    if (values.familyMembers.length > 0 && familyId) {
                        const familyPromises = values.familyMembers.map((fam) => {
                            return addMembers({
                                ...fam,
                                Invite_Code: values.Invite_Code,
                                FamilyId: familyId,
                                Activity: fam.Activity === "Other" ? fam.OtherActivity : fam.Activity,
                                Street: fam.SameAddress ? values.Street : (fam.Street || values.Street),
                                City: fam.SameAddress ? values.City : (fam.City || values.City),
                                State: fam.SameAddress ? values.State : (fam.State || values.State),
                                Zip: fam.SameAddress ? values.Zip : (fam.Zip || values.Zip),
                                EmailAddress: fam.Email || "",
                            }).unwrap();
                        });
                        await Promise.all(familyPromises);
                    }

                    if (primaryUUID) {
                        await sendEmail({
                            recipientIds: [primaryUUID],
                            subject: email_template?.subject || "Welcome to JJO",
                            body: email_template?.body || "",
                        }).unwrap();
                    }
                    toast.success("Enrolment Successful!");
                    reset();
                    setClientSecret(null);
                }
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Sync error.");
        } finally {
            setIsLoopingCreation(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f5f0] pb-20 font-sans text-[#4a3f35]">
            <nav className="flex items-center justify-between px-8 py-4 bg-[#fdfbf7] border-b-2 border-[#eaddc7] sticky top-0 z-[100]">
                <div className="flex items-center gap-3">
                    <Image src="/images/JJOLogo.png" alt="JJO Logo" width={60} height={60} />
                    <span className="text-xl font-serif font-bold tracking-tight text-[#4a3f35]">
                        JJO <span className="text-[#b49157]">Registration</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/events"><Button variant="ghost" className="gap-2"><CalendarHeart className="w-4 h-4 text-[#b49157]" />Events</Button></Link>
                    <Link href="/login"><Button variant="ghost" className="gap-2"><UserLock className="w-4 h-4 text-[#b49157]" />Admin</Button></Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <Award className="w-10 h-10 text-[#b49157] mx-auto mb-4" />
                    <h1 className="text-4xl font-serif font-bold text-[#2d2a26]">Member Enrolment</h1>
                </div>

                <form className="space-y-8">
                    {/* 01. PRIMARY MEMBER */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#eaddc7] overflow-hidden">
                        <div className="bg-[#fdfbf7] px-8 py-4 border-b border-[#eaddc7] flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#b49157]" />
                            <h3 className="font-bold text-sm uppercase tracking-widest">01. Primary Member</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase text-[#6b5f52]">Full Name</Label>
                                    <Input {...register("Name")} placeholder="John Doe" className={cn("h-11 border-[#eaddc7]", errors.Name && "border-red-500")} />
                                    <FormError message={errors.Name?.message} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase flex items-center gap-1 text-[#6b5f52]">
                                        <Ticket className="w-3 h-3 text-[#b49157]" /> Invite Code
                                    </Label>
                                    <Input {...register("Invite_Code")} placeholder="6 Digits" maxLength={6} className="h-11 border-[#eaddc7] uppercase font-mono" />
                                    <FormError message={errors.Invite_Code?.message} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase text-[#6b5f52]">Phone Number</Label>
                                    <Input {...register("PhoneNo")} className="h-11 border-[#eaddc7]" placeholder="Enter phone" />
                                    <FormError message={errors.PhoneNo?.message} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase text-[#6b5f52]">Email Address</Label>
                                    <Input {...register("EmailAddress")} type="email" className="h-11 border-[#eaddc7]" placeholder="johndoe@gmail.com" />
                                    <FormError message={errors.EmailAddress?.message} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase text-[#6b5f52]">Gender</Label>
                                    <Controller control={control} name="Gender" render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-11 w-full border-[#eaddc7]"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem></SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase text-[#6b5f52]">DOB</Label>
                                    <Controller control={control} name="DOB" render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild><Button variant="outline" className="w-full h-11 border-[#eaddc7] justify-start text-xs font-normal"><CalendarIcon className="mr-2 h-3 w-3 text-[#b49157]" />{field.value ? format(field.value, "MM/dd/yyyy") : "MM/DD/YYYY"}</Button></PopoverTrigger>
                                            <PopoverContent className="p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-years" fromYear={1920} toYear={2026} /></PopoverContent>
                                        </Popover>
                                    )} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase text-[#6b5f52]">Activity</Label>
                                    <Controller control={control} name="Activity" render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-11 w-full border-[#eaddc7]"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Dance">Dance</SelectItem>
                                                <SelectItem value="Singing">Singing</SelectItem>
                                                <SelectItem value="Musical instruments">Musical Instruments</SelectItem>
                                                <SelectItem value="Recitation">Recitation</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                {primaryActivity === "Other" && (
                                    <div className="md:col-span-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="font-semibold text-xs uppercase text-[#6b5f52]">Please Specify Activity</Label>
                                        <Input {...register("OtherActivity")} placeholder="Enter your activity" className="h-11 border-[#eaddc7]" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 02. MAILING ADDRESS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#eaddc7] overflow-hidden">
                        <div className="bg-[#fdfbf7] px-8 py-4 border-b border-[#eaddc7] flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#b49157]" />
                            <h3 className="font-bold text-sm uppercase tracking-widest">02. Mailing Address</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <Input {...register("Street")} placeholder="Street Address" className="h-11 border-[#eaddc7]" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input {...register("City")} placeholder="City" className="h-11 border-[#eaddc7]" />
                                <Input {...register("State")} placeholder="State" className="h-11 border-[#eaddc7]" />
                                <Input {...register("Zip")} placeholder="Zip" className="h-11 border-[#eaddc7]" />
                            </div>
                        </div>
                    </div>

                    {/* ADDITIONAL MEMBERS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                                <Users className="w-4 h-4 text-[#b49157]" /> Additional Members
                            </div>
                            <Button type="button" onClick={() => append({ Name: "", Gender: "M", Activity: "Dance", SameAddress: true, Email: "" })} className="bg-[#b49157] text-white rounded-lg h-8 px-4 text-xs font-bold">+ Add Family</Button>
                        </div>
                        <div className="grid gap-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="group relative p-6 bg-white rounded-2xl border border-[#eaddc7] space-y-4 transition-shadow hover:shadow-lg">
                                    <Button type="button" variant="ghost" onClick={() => remove(index)} className="absolute -top-2 -right-2 bg-red-50 text-red-500 rounded-full w-8 h-8 p-0 border border-red-100 hover:bg-red-500 hover:text-white transition-colors"><X className="w-4 h-4" /></Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="lg:col-span-1 space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-[#b49157]">Name</Label>
                                            <Input placeholder="Full Name" {...register(`familyMembers.${index}.Name`)} className="h-10 border-[#eaddc7]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-[#b49157]">Email (Optional)</Label>
                                            <Input placeholder="email@example.com" {...register(`familyMembers.${index}.Email`)} className="h-10 border-[#eaddc7]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-[#b49157]">Activity</Label>
                                            <Controller control={control} name={`familyMembers.${index}.Activity`} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-10 w-full border-[#eaddc7]"><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="Dance">Dance</SelectItem><SelectItem value="Singing">Singing</SelectItem><SelectItem value="Musical instruments">Musical Instruments</SelectItem><SelectItem value="Recitation">Recitation</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                                </Select>
                                            )} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-[#b49157]">Gender</Label>
                                            <Controller control={control} name={`familyMembers.${index}.Gender`} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-10 w-full border-[#eaddc7]"><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem></SelectContent>
                                                </Select>
                                            )} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-[#b49157]">DOB</Label>
                                            <Controller control={control} name={`familyMembers.${index}.DOB`} render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild><Button variant="outline" className="w-full h-10 border-[#eaddc7] justify-start text-[10px] px-2 font-normal"><CalendarIcon className="mr-2 h-3 w-3 text-[#b49157]" />{field.value ? format(field.value, "MM/dd/yy") : "Select"}</Button></PopoverTrigger>
                                                    <PopoverContent className="p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-years" fromYear={1920} toYear={2026} /></PopoverContent>
                                                </Popover>
                                            )} />
                                        </div>
                                        {familyMembersWatch?.[index]?.Activity === "Other" && (
                                            <div className="md:col-span-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Label className="text-[10px] uppercase font-bold text-[#b49157]">Please Specify Activity</Label>
                                                <Input {...register(`familyMembers.${index}.OtherActivity` as const)} placeholder="Enter your activity" className="h-10 border-[#eaddc7]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-[#eaddc7]/50">
                                        <div className="flex items-center space-x-2 py-2">
                                            <Controller control={control} name={`familyMembers.${index}.SameAddress`} render={({ field }) => (
                                                <Checkbox id={`same-address-${index}`} checked={field.value} onCheckedChange={field.onChange} />
                                            )} />
                                            <label htmlFor={`same-address-${index}`} className="text-xs font-medium text-[#6b5f52] cursor-pointer"><Home className="w-3 h-3 inline mr-1" /> Same as primary address</label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="bg-[#f3ede4] rounded-2xl border-2 border-[#b49157]/20 p-8 space-y-6">
                        <h3 className="font-bold text-[#2d2a26] text-center uppercase tracking-widest flex items-center justify-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#b49157]" /> Transfer Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-[#6b5f52] font-semibold text-xs uppercase">Transaction Amount</Label>
                                <Input {...register("Amount")} type="number" className="h-11 bg-white border-[#eaddc7]" placeholder="0.00" />
                                <FormError message={errors.Amount?.message} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[#6b5f52] font-semibold text-xs uppercase">Payment Date</Label>
                                <Controller control={control} name="TransactionDate" render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" className="w-full h-11 bg-white border-[#eaddc7] justify-start text-xs font-normal"><CalendarIcon className="mr-2 h-3 w-3 text-[#b49157]" />{field.value ? format(field.value, "PPP") : "Select Date"}</Button></PopoverTrigger>
                                        <PopoverContent className="p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} fromYear={2024} toYear={2026} /></PopoverContent>
                                    </Popover>
                                )} />
                                <FormError message={errors.TransactionDate?.message} />
                            </div>
                        </div>

                        {/* STRIPE INTEGRATION */}
                        <div className="pt-6 border-t border-[#b49157]/10">
                            {clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat', variables: { colorPrimary: '#b49157' } } }}>
                                    <StripeSubmitSection
                                        isProcessing={isLoopingCreation}
                                        onConfirm={(s, e) => handleFinalSubmit(s, e)}
                                    />
                                </Elements>
                            ) : (
                                <div className="bg-white/50 p-10 rounded-xl border border-dashed border-[#eaddc7] flex flex-col items-center justify-center text-center">
                                    {loadingSecret ? (
                                        <>
                                            <Loader2 className="w-8 h-8 animate-spin text-[#b49157] mb-2" />
                                            <p className="text-xs text-[#8c7e6d]">Initializing Stripe Gateway...</p>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-8 h-8 text-[#eaddc7] mb-2" />
                                            <p className="text-xs text-[#8c7e6d]">Enter Name, Email, and Amount above to enable secure checkout.</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}



