import { baseApi } from "../baseApi";

interface Particiapants {
	lastUpdated: Date;
	participants: [
		{
			email: string;
			firstName: string;
			guestType: string;
			lastName: string;
			phone: string;
			sl: number;
			status: string;
		}
	];
}

export const listingApi = baseApi
	.enhanceEndpoints({
		addTagTypes: ["get-participants"],
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			getParticipants: builder.query<Particiapants, { search?: string }>({
				query: ({ search = "" }) => ({
					url: "/participants",
					method: "GET",
					params: {
						search,
					},
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}),
				providesTags: ["get-participants"],
			}),
		}),
	});
export const { useGetParticipantsQuery } = listingApi;
