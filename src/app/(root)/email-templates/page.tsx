"use client";
import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic"; // Required for Next.js
import { format } from "date-fns";
import {
    FileText,
    Plus,
    Search,
    Pencil,
    Trash2,
    MoreHorizontal,
    Info,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Import Quill Styles
import "react-quill-new/dist/quill.snow.css";
import {
    useAddTemplatesMutation,
    useDeleteTemplatesMutation,
    useEditTemplatesMutation,
    useGetTemplatesQuery,
} from "@/store/features/email-template";
import { toast } from "sonner";

// Dynamically import ReactQuill to avoid SSR issues in Next.js
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => (
        <div className="h-64 w-full bg-gray-50 flex items-center justify-center text-gray-400 rounded-md border">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Editor...
        </div>
    ),
});

// --- TYPES ---
interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string; // HTML string
    updatedAt: Date;
}

const EmailTemplatesPage = () => {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // NEW: State for viewing a specific template
    const [viewTemplate, setViewTemplate] = useState<EmailTemplate | null>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        body: "",
    });

    const [
        addTemplate,
        { isLoading: addTemplateIsLoading },
    ] = useAddTemplatesMutation();
    const {
        data: templatesData,
        isLoading: templatesIsLoading,
        refetch,
    } = useGetTemplatesQuery({ search: searchQuery });
    const templateList = templatesData?.data || [];

    const [
        editTemplate,
        { isLoading: editTemplateIsLoading },
    ] = useEditTemplatesMutation();

    const [
        deleteTemplate,
    ] = useDeleteTemplatesMutation();

    // --- EDITOR CONFIGURATION ---
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                ],
                ["link", "clean"],
            ],
        }),
        []
    );

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
    ];

    // --- HANDLERS ---
    const handleResetForm = () => {
        setFormData({ name: "", subject: "", body: "" });
        setEditingId(null);
    };

    const handleOpenAdd = () => {
        handleResetForm();
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (template: EmailTemplate) => {
        setFormData({
            name: template.name,
            subject: template.subject,
            body: template.body,
        });
        setEditingId(template.id);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.subject || !formData.body) return;

        if (editingId) {
            const res = await editTemplate({
                id: editingId,
                name: formData.name,
                subject: formData.subject,
                body: formData.body,
            }).unwrap();
            if (res.success) {
                toast.success(res.message);
                setIsDialogOpen(false);
                handleResetForm();
                refetch();
            }
        } else {
            const res = await addTemplate({
                name: formData.name,
                subject: formData.subject,
                body: formData.body,
            }).unwrap();
            if (res.success) {
                toast.success(res.message);
                setIsDialogOpen(false);
                handleResetForm();
                refetch();
            }
        }
    };

    const handleDelete = async (id: string) => {
        const res = await deleteTemplate({ id }).unwrap();
        if (res.success) {
            toast.promise(Promise.resolve(res.message), {
                loading: "Deleting...",
                success: res.message,
            });
            setIsDialogOpen(false);
            handleResetForm();
            refetch();
        }
    };

    if (templatesIsLoading)
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                    <p className="text-sm text-gray-500">
                        Manage the standard responses and automated emails sent to members.
                    </p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={handleOpenAdd}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 rounded-lg w-full md:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-gray-200">
                                <TableHead className="w-[250px] font-semibold text-gray-700">Template Name</TableHead>
                                <TableHead className="font-semibold text-gray-700">Subject Line</TableHead>
                                <TableHead className="w-[180px] font-semibold text-gray-700">Last Updated</TableHead>
                                <TableHead className="w-20 text-right font-semibold text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templateList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                        No templates found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templateList.map((template) => (
                                    <TableRow
                                        key={template.id}
                                        // UPDATED: Added onClick to view details and cursor-pointer
                                        onClick={() => setViewTemplate(template)}
                                        className="hover:bg-gray-50 border-gray-100 group transition-colors cursor-pointer"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900">{template.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-gray-600">{template.subject}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-gray-500">
                                                {format(template.updatedAt, "PPP")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                {/* UPDATED: Added stopPropagation to prevent row click */}
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-gray-100 shadow-lg">
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation(); // Stop propagation
                                                        handleOpenEdit(template);
                                                    }}>
                                                        <Pencil className="w-4 h-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Stop propagation
                                                            handleDelete(template.id);
                                                        }}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* CREATE / EDIT DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl rounded-2xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Template" : "Create New Template"}</DialogTitle>
                        <DialogDescription>Configure the email subject and body.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-5 py-2">
                        {/* Template Name */}
                        <div className="grid gap-2">
                            <Label>Template Name (Internal)</Label>
                            <Input
                                placeholder="e.g. Monthly Newsletter"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Subject */}
                        <div className="grid gap-2">
                            <Label>Email Subject</Label>
                            <Input
                                placeholder="e.g. Welcome to the family!"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        {/* Editor Body */}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Email Body</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center text-xs text-indigo-600 cursor-pointer hover:underline bg-indigo-50 px-2 py-1 rounded-full">
                                                <Info className="w-3 h-3 mr-1" /> Variables
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-900 text-white border-none p-4">
                                            <p className="font-semibold mb-2">Available Placeholders:</p>
                                            <ul className="list-disc pl-4 space-y-1 text-xs">
                                                <li>{"{{firstName}}"}</li>
                                                <li>{"{{lastName}}"}</li>
                                                <li>{"{{email}}"}</li>
                                                <li>{"{{phone}}"}</li>
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="quill-wrapper">
                                <ReactQuill
                                    theme="snow"
                                    modules={modules}
                                    formats={formats}
                                    value={formData.body}
                                    onChange={(value) => setFormData({ ...formData, body: value })}
                                    className="h-64 sm:h-80 mb-12"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={addTemplateIsLoading || editTemplateIsLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {(addTemplateIsLoading || editTemplateIsLoading) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {editingId ? "Save Changes" : "Create Template"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* NEW: VIEW DETAILS DIALOG */}
            <Dialog open={!!viewTemplate} onOpenChange={(open) => !open && setViewTemplate(null)}>
                <DialogContent className="max-w-3xl rounded-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-xl">{viewTemplate?.name}</DialogTitle>
                                <DialogDescription>
                                    Last updated: {viewTemplate && format(new Date(viewTemplate.updatedAt), "PPP p")}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-500 uppercase text-xs tracking-wider font-semibold">Subject Line</Label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-900">
                                {viewTemplate?.subject}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-500 uppercase text-xs tracking-wider font-semibold">Email Content</Label>
                            <div 
                                className="p-6 bg-white rounded-xl border border-gray-200 prose prose-indigo max-w-none shadow-sm min-h-[200px]"
                                dangerouslySetInnerHTML={{ __html: viewTemplate?.body || "" }}
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => setViewTemplate(null)}>Close</Button>
                        <Button onClick={() => {
                            const temp = viewTemplate;
                            setViewTemplate(null);
                            if(temp) handleOpenEdit(temp);
                        }}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Global Style Override for Quill */}
            <style jsx global>{`
                .quill-wrapper .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    border-color: #e2e8f0;
                    background-color: #f8fafc;
                }
                .quill-wrapper .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-color: #e2e8f0;
                    font-family: inherit;
                    font-size: 0.875rem;
                }
                .quill-wrapper .ql-editor {
                    min-height: 16rem;
                }
            `}</style>
        </div>
    );
};

export default EmailTemplatesPage;