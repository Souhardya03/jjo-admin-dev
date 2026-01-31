import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Providers from "@/store/provider";
import { Toaster } from "@/components/ui/sonner"

const figtree = Figtree({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-figtree",
	display: "swap",
});

export const metadata: Metadata = {
	title: "JJO Admin Panel",
	description: "Administrative dashboard for managing JJO platform operations.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${figtree.className} antialiased`}>
				<Toaster position="top-center"/>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
