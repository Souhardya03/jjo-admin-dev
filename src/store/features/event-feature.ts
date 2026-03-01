import { baseApi } from "../baseApi";

export interface AddeventsResponse {
	success: boolean;
	message: string;
	event_id: string;
}

export interface GeteventsResponse {
	success: boolean;
	count: number;
	total: number;
	next_page: boolean;
	next_key: string | null;
	data: events[];
}
export interface events {
	event_slug: string;
	zip: string;
	created_at: string;
	active_flag: string;
	state: string;
	city: string;
	org_id: string;
	event_id: string;
	address_ln2: string;
	address_ln1: string;
	event_alt_date: string;
	event_date: string;
	event_name: string;
}

export interface AddUpdateResponse {
	success: boolean;
	message: string;
}

export interface AddDeleteResponse {
	success: boolean;
	message: string;
}

export const listingApi = baseApi
	.enhanceEndpoints({
		addTagTypes: ["add-events", "get-events", "edit-events", "delete-events"],
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			addevents: builder.mutation<AddeventsResponse, unknown>({
				query: (data) => ({
					url: "/events",
					method: "POST",
					body: data,
					// credentials: "include",
				}),
				invalidatesTags: ["add-events", "get-events"],
			}),

			editevents: builder.mutation<
				AddUpdateResponse,
				{ event_id: string; data: unknown }
			>({
				query: ({ event_id, data }) => ({
					url: `/events`,
					method: "PUT",
					params: {
						event_id,
					},
					body: data,
					// credentials: "include",
				}),
				invalidatesTags: ["edit-events", "get-events"],
			}),

			deleteevents: builder.mutation<AddDeleteResponse, string>({
				query: (event_id) => ({
					url: `/events`,
					method: "DELETE",
					params: {
						event_id,
					},
					headers: {
						"Content-Type": "application/json",
					},
					// credentials: "include",
				}),
				invalidatesTags: ["delete-events", "get-events"],
			}),

			getevents: builder.query<
				GeteventsResponse,
				{
					search?: string;
					page?: number;
					limit?: number;

					lastKey?: string;
				}
			>({
				query: ({ search = "", limit = "", lastKey = "" }) => ({
					url: "/events",
					method: "GET",
					params: {
						search,
						limit,
						lastKey,
					},
					headers: {
						"Content-Type": "application/json",
					},

					// credentials: "include",
				}),
				providesTags: ["get-events"],
			}),
		}),
	});

export const {
	useAddeventsMutation,
	useGeteventsQuery,
	useEditeventsMutation,
	useDeleteeventsMutation,
} = listingApi;
