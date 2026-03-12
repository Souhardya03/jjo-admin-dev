import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { CalendarHeart, UserLock } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-[#fdfbf7] border-b-2 border-[#eaddc7] sticky top-0 z-[100]">
            <div className="flex items-center gap-3">
                <Image
                    src={"/images/JJOLogo.png"}
                    alt="JJO Logo"
                    width={60}
                    height={60}
                />
                <Link href="/registration" className="text-xl cursor-pointer font-serif font-bold tracking-tight text-[#4a3f35]">
                    JJO <span className="text-[#b49157]">Registration</span>
                </Link>
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