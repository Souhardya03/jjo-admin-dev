import RegistrationForm from "@/components/RegistrationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JJO | Registration",
  description: "Join our community and register for the organization",
};

export default function RegistrationPage() {
  return <RegistrationForm />;
}