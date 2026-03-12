import EventsPage from '@/components/pages/EventsPage'
import React from 'react'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JJO | Events",
  description: "Join our community and register for the organization",
};

const page = () => {
  return (
	<EventsPage/>
  )
}

export default page