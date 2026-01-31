"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Search,
  Plus,
  Clock,
  Edit,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Mic2,
  X,
  Save,
  MoreHorizontal,
  Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

// --- Types ---
type EventStatus = "Upcoming" | "Draft" | "Completed" | "Cancelled";
type Role = "Attendee" | "Speaker" | "VIP";
type PartStatus = "Confirmed" | "Pending";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: PartStatus;
  avatar?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // Using ISO string for easier input handling
  location: string;
  status: EventStatus;
  attendees: number;
  capacity: number;
  price: number;
  image?: string;
  schedule: ScheduleItem[];
  participants: Participant[];
}

// --- Mock Data ---
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Annual Tech Summit 2025",
    description: "The biggest tech conference of the year featuring top speakers and networking opportunities.",
    date: "2025-11-15T09:00",
    location: "Convention Center, NY",
    status: "Upcoming",
    attendees: 450,
    capacity: 500,
    price: 199,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
    schedule: [
      { id: "s1", time: "09:00", title: "Registration", description: "Lobby Area" },
      { id: "s2", time: "10:00", title: "Keynote: Future of AI", speaker: "Dr. Sarah Conner" },
    ],
    participants: [
        { id: "p1", name: "Alice Johnson", email: "alice@example.com", role: "Speaker", status: "Confirmed" },
        { id: "p2", name: "Bob Smith", email: "bob@example.com", role: "Attendee", status: "Confirmed" },
    ]
  },
  {
    id: "2",
    title: "React Workshop",
    description: "Hands-on session to learn React hooks.",
    date: "2025-10-20T14:00",
    location: "Tech Hub, Room A",
    status: "Upcoming",
    attendees: 25,
    capacity: 30,
    price: 49,
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000",
    schedule: [
        { id: "s1", time: "14:00", title: "Intro to Hooks", speaker: "John Doe" },
    ],
    participants: [
        { id: "p4", name: "David Wilson", email: "david@example.com", role: "Attendee", status: "Confirmed" },
    ]
  },
];

// --- Main Page Component ---
const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // --- Create Form State ---
  const [newScheduleItems, setNewScheduleItems] = useState<ScheduleItem[]>([]);
  const [hasSchedule, setHasSchedule] = useState(false);

  // --- Handlers ---
  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newEvent: Event = {
        id: Date.now().toString(),
        title: formData.get("title") as string || "Untitled Event",
        description: formData.get("description") as string || "",
        date: formData.get("date") as string || new Date().toISOString(),
        location: formData.get("location") as string || "TBD",
        status: formData.get("status") as EventStatus || "Draft",
        capacity: Number(formData.get("capacity")) || 0,
        price: Number(formData.get("price")) || 0,
        attendees: 0,
        schedule: hasSchedule ? newScheduleItems : [],
        participants: []
    };

    setEvents([newEvent, ...events]);
    setIsCreateOpen(false);
    setNewScheduleItems([]);
    setHasSchedule(false);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev));
    setSelectedEventId(null); // Go back to list view
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setSelectedEventId(null);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Filter Logic
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && event.status.toLowerCase() === activeTab;
  });

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => e.status === "Upcoming").length,
    past: events.filter((e) => e.status === "Completed").length,
    attendees: events.reduce((acc, curr) => acc + curr.attendees, 0),
  };

  // --- Render Detail View ---
  if (selectedEvent) {
    return (
      <EventDetailView 
        initialEvent={selectedEvent} 
        onBack={() => setSelectedEventId(null)} 
        onSave={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    );
  }

  // --- Render Dashboard ---
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Events Management</h1>
          <p className="text-sm text-gray-500">Create, edit and manage your events.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: stats.total, icon: CalendarIcon, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Completed", value: stats.past, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Attendees", value: stats.attendees, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto hidden sm:flex">
            <TabsTrigger value="all" className="rounded-lg">All Events</TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg">Upcoming</TabsTrigger>
            <TabsTrigger value="draft" className="rounded-lg">Drafts</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Past</TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-200 rounded-xl"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
                <EventCard 
                key={event.id} 
                event={event} 
                onClick={() => setSelectedEventId(event.id)} 
                />
            ))}
            </div>
            {filteredEvents.length === 0 && (
                <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed">
                    No events found.
                </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateEvent}>
            <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Enter event details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required placeholder="Event Name" className="bg-gray-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" name="date" type="datetime-local" required className="bg-gray-50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue="upcoming">
                            <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" placeholder="Venue or Link" className="bg-gray-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input id="capacity" name="capacity" type="number" className="bg-gray-50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" className="bg-gray-50" />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Details..." className="bg-gray-50" />
                </div>
                
                {/* Simple Schedule Builder for Create */}
                <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="hasSchedule" checked={hasSchedule} onCheckedChange={(c) => setHasSchedule(c as boolean)} />
                        <Label htmlFor="hasSchedule">Add Schedule</Label>
                    </div>
                    {hasSchedule && (
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                            {newScheduleItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input value={item.time} onChange={e => {
                                        const update = [...newScheduleItems];
                                        update[idx].time = e.target.value;
                                        setNewScheduleItems(update);
                                    }} type="time" className="w-24 h-8 text-xs bg-white" />
                                    <Input value={item.title} onChange={e => {
                                        const update = [...newScheduleItems];
                                        update[idx].title = e.target.value;
                                        setNewScheduleItems(update);
                                    }} placeholder="Session Title" className="flex-1 h-8 text-xs bg-white" />
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => setNewScheduleItems([...newScheduleItems, { id: Date.now().toString(), time: "", title: "" }])}>
                                Add Session
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 text-white">Create Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- SUB-COMPONENT: Editable Detail View ---

interface DetailViewProps {
    initialEvent: Event;
    onBack: () => void;
    onSave: (event: Event) => void;
    onDelete: (id: string) => void;
}

const EventDetailView = ({ initialEvent, onBack, onSave, onDelete }: DetailViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Event>(initialEvent);

  // Sync if prop changes (optional)
  useEffect(() => { setFormData(initialEvent); }, [initialEvent]);

  // Generic Field Handler
  const handleChange = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Schedule Handlers
  const handleScheduleChange = (id: string, field: keyof ScheduleItem, value: string) => {
    setFormData(prev => ({
        ...prev,
        schedule: prev.schedule.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };
  const addScheduleRow = () => {
    setFormData(prev => ({
        ...prev,
        schedule: [...prev.schedule, { id: Date.now().toString(), time: "09:00", title: "", speaker: "" }]
    }));
  };
  const deleteScheduleRow = (id: string) => {
    setFormData(prev => ({ ...prev, schedule: prev.schedule.filter(s => s.id !== id) }));
  };

  // Participant Handlers
  const handleParticipantChange = (id: string, field: keyof Participant, value: string) => {
    setFormData(prev => ({
        ...prev,
        participants: prev.participants.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };
  const addParticipant = () => {
      setFormData(prev => ({
          ...prev,
          participants: [...prev.participants, { id: Date.now().toString(), name: "", email: "", role: "Attendee", status: "Pending" }]
      }));
  };
  const deleteParticipant = (id: string) => {
      setFormData(prev => ({ ...prev, participants: prev.participants.filter(p => p.id !== id) }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6 pb-20">
      {/* Detail Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4 w-full">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full shrink-0">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex-1 w-full">
                {isEditing ? (
                    <div className="space-y-2 w-full max-w-lg">
                        <Input 
                            value={formData.title} 
                            onChange={(e) => handleChange("title", e.target.value)} 
                            className="text-lg font-bold h-10" 
                        />
                        <div className="flex gap-2">
                             <Input 
                                type="datetime-local" 
                                value={formData.date} 
                                onChange={(e) => handleChange("date", e.target.value)}
                                className="h-8 text-xs w-auto"
                            />
                            <Select 
                                value={formData.status} 
                                onValueChange={(val) => handleChange("status", val)}
                            >
                                <SelectTrigger className="h-8 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            {formData.title}
                            <Badge variant="outline" className={cn(
                                "font-normal",
                                formData.status === "Upcoming" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-100 text-gray-600"
                            )}>{formData.status}</Badge>
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {format(new Date(formData.date), "PPP p")} 
                            <span className="text-gray-300">|</span>
                            <MapPin className="w-3.5 h-3.5" />
                            {formData.location}
                        </p>
                    </div>
                )}
            </div>
         </div>
         <div className="flex gap-2 shrink-0">
            {isEditing ? (
                <>
                    <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(initialEvent); }}>
                        Cancel
                    </Button>
                    <Button className="bg-indigo-600 text-white" onClick={() => { onSave(formData); setIsEditing(false); }}>
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Event
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => onDelete(formData.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </>
            )}
         </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-lg">Schedule</TabsTrigger>
            <TabsTrigger value="participants" className="rounded-lg">Participants ({formData.participants.length})</TabsTrigger>
        </TabsList>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">About this Event</h3>
                        {isEditing ? (
                            <Textarea 
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                className="min-h-[150px] bg-gray-50"
                            />
                        ) : (
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                        )}
                        
                        {isEditing && (
                            <div className="mt-4">
                                <Label>Location</Label>
                                <Input 
                                    value={formData.location} 
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    className="mt-1 bg-gray-50"
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center h-8">
                                <span className="text-gray-600">Capacity</span>
                                {isEditing ? (
                                    <Input 
                                        type="number" 
                                        value={formData.capacity} 
                                        onChange={(e) => handleChange("capacity", Number(e.target.value))}
                                        className="w-20 h-8 text-right bg-gray-50"
                                    />
                                ) : (
                                    <span className="font-medium">{formData.capacity}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center h-8">
                                <span className="text-gray-600">Registered</span>
                                <span className="font-medium text-indigo-600">{formData.attendees}</span>
                            </div>
                            <div className="flex justify-between items-center h-8">
                                <span className="text-gray-600">Ticket Price</span>
                                {isEditing ? (
                                    <Input 
                                        type="number" 
                                        value={formData.price} 
                                        onChange={(e) => handleChange("price", Number(e.target.value))}
                                        className="w-20 h-8 text-right bg-gray-50"
                                    />
                                ) : (
                                    <span className="font-medium">${formData.price}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TabsContent>

        {/* --- SCHEDULE TAB --- */}
        <TabsContent value="schedule" className="mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Event Agenda</h3>
                    {isEditing && (
                        <Button size="sm" variant="outline" className="bg-white" onClick={addScheduleRow}>
                            <Plus className="w-4 h-4 mr-2" /> Add Session
                        </Button>
                    )}
                </div>
                
                {formData.schedule.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {formData.schedule.map((item) => (
                            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-gray-50 transition-colors group items-start">
                                {isEditing ? (
                                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                        <div className="md:col-span-2">
                                            <Label className="text-[10px] text-gray-400">Time</Label>
                                            <Input type="time" value={item.time} onChange={(e) => handleScheduleChange(item.id, "time", e.target.value)} className="bg-white" />
                                        </div>
                                        <div className="md:col-span-4">
                                            <Label className="text-[10px] text-gray-400">Title</Label>
                                            <Input value={item.title} onChange={(e) => handleScheduleChange(item.id, "title", e.target.value)} className="bg-white" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <Label className="text-[10px] text-gray-400">Speaker</Label>
                                            <Input value={item.speaker || ""} onChange={(e) => handleScheduleChange(item.id, "speaker", e.target.value)} className="bg-white" />
                                        </div>
                                        <div className="md:col-span-2">
                                             <Label className="text-[10px] text-gray-400">Desc</Label>
                                            <Input value={item.description || ""} onChange={(e) => handleScheduleChange(item.id, "description", e.target.value)} className="bg-white" />
                                        </div>
                                        <div className="md:col-span-1 pt-4 flex justify-end">
                                             <Button variant="ghost" size="icon" onClick={() => deleteScheduleRow(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                ) : (
                                    // READ ONLY VIEW
                                    <>
                                        <div className="min-w-[100px] flex flex-row sm:flex-col items-center sm:items-start gap-2">
                                            <Badge variant="secondary" className="font-mono">{item.time}</Badge>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 text-lg">{item.title}</h4>
                                            {item.description && <p className="text-gray-500 mt-1">{item.description}</p>}
                                            {item.speaker && (
                                                <div className="flex items-center gap-2 mt-3 text-sm text-indigo-600 font-medium">
                                                    <Mic2 className="w-4 h-4" />
                                                    {item.speaker}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-medium">No schedule yet</h3>
                        {isEditing ? (
                             <Button variant="link" onClick={addScheduleRow}>Add your first session</Button>
                        ) : (
                            <p className="text-gray-500 text-sm">Switch to Edit mode to add agenda.</p>
                        )}
                    </div>
                )}
            </div>
        </TabsContent>

        {/* --- PARTICIPANTS TAB --- */}
        <TabsContent value="participants" className="mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Attendees List</h3>
                    <div className="flex gap-2">
                        {isEditing ? (
                             <Button size="sm" onClick={addParticipant} className="bg-indigo-600 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Add Participant
                             </Button>
                        ) : (
                            <>
                                <Button size="sm" variant="outline" className="bg-white">Export CSV</Button>
                                <Button size="sm" className="bg-indigo-600 text-white">Invite</Button>
                            </>
                        )}
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead>Participant</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {formData.participants.map((person) => (
                            <TableRow key={person.id}>
                                <TableCell>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Input 
                                                value={person.name} 
                                                onChange={(e) => handleParticipantChange(person.id, "name", e.target.value)} 
                                                placeholder="Name" 
                                                className="h-8"
                                            />
                                            <Input 
                                                value={person.email} 
                                                onChange={(e) => handleParticipantChange(person.id, "email", e.target.value)} 
                                                placeholder="Email" 
                                                className="h-8"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={person.avatar} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                                    {person.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900">{person.name}</p>
                                                <p className="text-xs text-gray-500">{person.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <Select value={person.role} onValueChange={(val) => handleParticipantChange(person.id, "role", val)}>
                                            <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Attendee">Attendee</SelectItem>
                                                <SelectItem value="Speaker">Speaker</SelectItem>
                                                <SelectItem value="VIP">VIP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="outline" className={cn(
                                            "border-0 font-medium",
                                            person.role === "Speaker" ? "bg-purple-100 text-purple-700" :
                                            person.role === "VIP" ? "bg-amber-100 text-amber-700" :
                                            "bg-blue-50 text-blue-700"
                                        )}>
                                            {person.role}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <Select value={person.status} onValueChange={(val) => handleParticipantChange(person.id, "status", val)}>
                                            <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className={cn("w-2 h-2 rounded-full", 
                                                person.status === "Confirmed" ? "bg-green-500" : "bg-gray-300"
                                            )} />
                                            {person.status}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isEditing ? (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => deleteParticipant(person.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                            <Mail className="w-4 h-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {formData.participants.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No participants registered yet.
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};


// --- SUB-COMPONENT: List Item Card ---
const EventCard = ({ event, onClick }: { event: Event, onClick: () => void }) => {
  const isFull = event.attendees >= event.capacity;
  const percentage = Math.round((event.attendees / event.capacity) * 100);

  return (
    <div 
        onClick={onClick}
        className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-40 w-full bg-gray-100">
        {event.image ? (
            <div className="w-full h-full relative">
                <Image src={event.image} alt={event.title} fill className="object-cover" />
            </div>
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-10 h-10" />
            </div>
        )}
        <div className="absolute top-3 left-3">
            <Badge className={cn("border-0 shadow-sm", event.status === "Upcoming" ? "bg-white/90 text-indigo-700" : "bg-gray-900/90 text-white")}>
                {event.status}
            </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
            <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {event.title}
                </h3>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{event.description}</p>
            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-indigo-500" />
                    <span>{format(new Date(event.date), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span className="truncate">{event.location}</span>
                </div>
            </div>
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Attendees</span>
                <span className={cn("font-semibold", isFull ? "text-red-600" : "text-indigo-600")}>
                    {event.attendees} / {event.capacity}
                </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", isFull ? "bg-red-500" : "bg-indigo-500")} style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;