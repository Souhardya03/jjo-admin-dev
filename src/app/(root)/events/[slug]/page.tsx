import EventDetailsPage from '@/components/pages/EventDetailsPage';
import { Metadata } from "next";
import React from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const displayName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `JJO | Event - ${displayName}`,
    description: `Join our community and register for ${displayName} at our organization.`,
  };
}
const page = ({
    params,
}: {
    params: Promise<{ slug: string }>;
}) => {
	const { slug } = React.use(params);

	return (
		<EventDetailsPage props={{ slug }} />
	)
}

export default page