import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserLock } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6  bg-white border-b sticky top-0 z-[100]">
      <div className="flex items-center gap-2">
        <div className=" p-2 rounded-lg">
          <Image src={"/images/JJOLogo.png"} alt="" width={60} height={60}/>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          JJO Registration
        </h1>
      </div>
      
      <Link href="/login">
        <Button variant="outline" className="flex items-center gap-2 border-indigo-200 hover:bg-indigo-50">
          <UserLock className="w-4 h-4 text-indigo-600" />
          Admin
        </Button>
      </Link>
    </nav>
  );
}