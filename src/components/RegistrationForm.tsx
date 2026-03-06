"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    CalendarIcon,
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
    CalendarHeart,
    Home,
    Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegisterMembersMutation } from "@/store/features/members";
import Image from "next/image";
import { useGetTemplatesQuery, useSendEmailMutation } from "@/store/features/email-template";

// --- VALIDATION SCHEMA ---
const familyMemberSchema = z.object({
    Name: z.string().min(2, "Required"),
    Gender: z.string().min(1, "Required"),
    DOB: z.coerce.date().optional(),           // ✅ Fix 3
    Email: z.string().email("Invalid email").optional().or(z.literal("")),
    Activity: z.string().min(1, "Required"),
    OtherActivity: z.string().optional(),
    SameAddress: z.boolean().default(true),
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
    DOB: z.coerce.date().refine((d) => !isNaN(d.getTime()), { message: "DOB required" }),  // ✅ Fix 1
    Invite_Code: z.string().length(6, "Invite code must be 6 characters"),
    Activity: z.string().min(1, "Required"),
    OtherActivity: z.string().optional(),
    Street: z.string().min(1, "Street required"),
    City: z.string().min(1, "City required"),
    State: z.string().min(1, "State required"),
    Zip: z.string().min(5, "Zip required"),
    PaymentMethod: z.enum(["Zelle", "PayPal"]),
    Amount: z.string().min(1, "Amount required"),
    TransactionDate: z.coerce.date().refine((d) => !isNaN(d.getTime()), { message: "Date required" }), // ✅ Fix 1
    familyMembers: z.array(familyMemberSchema),
});
type RegistrationFormValues = z.infer<typeof schema>;

const FormError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <p className="text-red-500 text-[10px] italic mt-1">{message}</p>;
};

function Navbar() {
    return (
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
    );
}

export default function RegistrationForm() {
    const [isLoopingCreation, setIsLoopingCreation] = useState(false);
    const [addMembers] = useRegisterMembersMutation();
    const [sendEmail] = useSendEmailMutation();
    const { data: getEmailTemplate } = useGetTemplatesQuery({ search: "Welcome Mail" });
    const email_template = getEmailTemplate?.data[0];

    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<RegistrationFormValues, unknown, RegistrationFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { PaymentMethod: "Zelle", familyMembers: [] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "familyMembers" });
    const primaryActivity = watch("Activity");
    const familyMembersWatch = watch("familyMembers");

    const onSubmit = async (values: RegistrationFormValues) => {
        setIsLoopingCreation(true);
        try {
            const primaryPayload = {
                ...values,
                Activity: values.Activity === "Other" ? values.OtherActivity : values.Activity
            };
            const primaryRes = await addMembers(primaryPayload).unwrap();

            if (primaryRes?.success) {
                const familyId = primaryRes.FamilyId;
                const primaryUUID = primaryRes.UUID;

                if (values.familyMembers.length > 0 && familyId) {
                    const familyPromises = values.familyMembers.map((fam) => {
                        const famPayload = {
                            ...fam,
                            Invite_Code: values.Invite_Code,
                            FamilyId: familyId,
                            Activity: fam.Activity === "Other" ? fam.OtherActivity : fam.Activity,
                            Street: fam.SameAddress ? values.Street : fam.Street,
                            City: fam.SameAddress ? values.City : fam.City,
                            State: fam.SameAddress ? values.State : fam.State,
                            Zip: fam.SameAddress ? values.Zip : fam.Zip,
                            EmailAddress: fam.Email || "",
                        };
                        return addMembers(famPayload).unwrap();
                    });
                    await Promise.all(familyPromises);
                }

                try {
                    if (primaryUUID) {
                        await sendEmail({
                            recipientIds: [primaryUUID],
                            subject: email_template?.subject || "Welcome to JJO",
                            body: email_template?.body || "",
                        }).unwrap();
                    }
                } catch (emailErr) {
                    console.error("Email error:", emailErr);
                }

                toast.success("Registration completed successfully!");
                reset();
            }
        } 
        catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Registration failed.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f5f0] pb-20 font-sans text-[#4a3f35]">
            <Navbar />
            <main className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <Award className="w-10 h-10 text-[#b49157] mx-auto mb-4" />
                    <h1 className="text-4xl font-serif font-bold text-[#2d2a26]">Member Enrolment</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* PRIMARY MEMBER */}
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
                                    <Input {...register("Invite_Code")} placeholder="6 Digits" maxLength={6} className={cn("h-11 border-[#eaddc7] uppercase font-mono tracking-tighter", errors.Invite_Code && "border-red-500")} />
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
                                    <Input placeholder="johndoe@gmail.com" {...register("EmailAddress")} type="email" className={cn("h-11 border-[#eaddc7]", errors.EmailAddress && "border-red-500")} />
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
                                    <FormError message={errors.Gender?.message} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-xs uppercase text-[#6b5f52]">DOB</Label>
                                    <Controller control={control} name="DOB" render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full h-11 border-[#eaddc7] justify-start text-xs font-normal"><CalendarIcon className="mr-2 h-3 w-3 text-[#b49157]" />{field.value ? format(field.value, "MM/dd/yyyy") : "MM/DD/YYYY"}</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-years" fromYear={1920} toYear={2026} /></PopoverContent>
                                        </Popover>
                                    )} />
                                    <FormError message={errors.DOB?.message} />
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
                                    <FormError message={errors.Activity?.message} />
                                </div>
                            </div>
                            {primaryActivity === "Other" && <Input {...register("OtherActivity")} placeholder="Specify activity" className="h-11 border-[#b49157]/40" />}
                        </div>
                    </div>

                    {/* MAILING ADDRESS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#eaddc7] overflow-hidden">
                        <div className="bg-[#fdfbf7] px-8 py-4 border-b border-[#eaddc7] flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#b49157]" />
                            <h3 className="font-bold text-sm uppercase tracking-widest">02. Mailing Address</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <div><Input {...register("Street")} placeholder="Street Address" className="h-11 border-[#eaddc7]" /><FormError message={errors.Street?.message} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><Input {...register("City")} placeholder="City" className="h-11 border-[#eaddc7]" /><FormError message={errors.City?.message} /></div>
                                <div><Input {...register("State")} placeholder="State" className="h-11 border-[#eaddc7]" /><FormError message={errors.State?.message} /></div>
                                <div><Input {...register("Zip")} placeholder="Zip" className="h-11 border-[#eaddc7]" /><FormError message={errors.Zip?.message} /></div>
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
                        <div className="grid gr gap-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="group relative p-6 bg-white rounded-2xl border border-[#eaddc7] space-y-4 transition-shadow hover:shadow-lg">
                                    <Button type="button" variant="ghost" onClick={() => remove(index)} className="absolute -top-2 -right-2 bg-red-50 text-red-500 rounded-full w-8 h-8 p-0 border border-red-100 hover:bg-red-500 hover:text-white transition-colors"><X className="w-4 h-4" /></Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="lg:col-span-1 space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-[#b49157]">Name</Label>
                                            <Input placeholder="Full Name" {...register(`familyMembers.${index}.Name`)} className="h-10 border-[#eaddc7]" />
                                            <FormError message={errors.familyMembers?.[index]?.Name?.message} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-[#b49157]">Email (Optional)</Label>
                                            <Input placeholder="email@example.com" {...register(`familyMembers.${index}.Email`)} className="h-10 border-[#eaddc7]" />
                                            <FormError message={errors.familyMembers?.[index]?.Email?.message} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px]  uppercase font-bold text-[#b49157]">Activity</Label>
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
                                    </div>
                                    {familyMembersWatch?.[index]?.Activity === "Other" && <Input {...register(`familyMembers.${index}.OtherActivity`)} placeholder="Specify activity" className="mt-2 border-[#b49157]/40 h-10" />}
                                    <div className="pt-2 border-t border-[#eaddc7]/50">
                                        <div className="flex items-center space-x-2 py-2">
                                            <Controller control={control} name={`familyMembers.${index}.SameAddress`} render={({ field }) => (
                                                <Checkbox id={`same-address-${index}`} checked={field.value} onCheckedChange={field.onChange} />
                                            )} />
                                            <label htmlFor={`same-address-${index}`} className="text-xs font-medium text-[#6b5f52] cursor-pointer flex items-center gap-1"><Home className="w-3 h-3 inline" /> Same as primary address</label>
                                        </div>
                                        {!familyMembersWatch?.[index]?.SameAddress && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-in slide-in-from-top-2">
                                                <div className="md:col-span-3"><Input {...register(`familyMembers.${index}.Street`)} placeholder="Street Address" className="h-11 border-[#eaddc7]" /></div>
                                                <Input {...register(`familyMembers.${index}.City`)} placeholder="City" className="h-11 border-[#eaddc7]" />
                                                <Input {...register(`familyMembers.${index}.State`)} placeholder="State" className="h-11 border-[#eaddc7]" />
                                                <Input {...register(`familyMembers.${index}.Zip`)} placeholder="Zip" className="h-11 border-[#eaddc7]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="bg-[#f3ede4] rounded-2xl border-2 border-[#b49157]/20 p-8 space-y-6">
                        <h3 className="font-bold text-[#2d2a26] text-center uppercase tracking-widest flex items-center justify-center gap-2"><DollarSign className="w-4 h-4 text-[#b49157]" /> Transfer Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {["Zelle", "PayPal"].map((method) => (
                                <button key={method} type="button" onClick={() => setValue("PaymentMethod", method as any)} className={cn("flex items-center justify-center gap-3 py-6 rounded-xl border-2 transition-all", watch("PaymentMethod") === method ? "bg-white border-[#b49157] text-[#b49157] shadow-md ring-2 ring-[#b49157]/20" : "bg-white/50 border-[#eaddc7] text-[#8c7e6d] hover:bg-white")}>
                                    {method === "Zelle" ? <Wallet className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                                    <span className="font-bold uppercase text-xs">{method}</span>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5"><Label className="text-[#6b5f52] font-semibold text-xs uppercase">Transaction Amount</Label><Input {...register("Amount")} type="number" className="h-11 bg-white border-[#eaddc7]" placeholder="0.00" /><FormError message={errors.Amount?.message} /></div>
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
                    </div>

                    <Button type="submit" disabled={isLoopingCreation} className="w-full h-16 bg-[#2d2a26] hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl transition-all">
                        {isLoopingCreation ? <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-[#b49157]" /> PROCESSING...</span> : "Complete Enrolment"}
                    </Button>
                </form>
            </main>
        </div>
    );
}