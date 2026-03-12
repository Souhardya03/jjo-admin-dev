import { baseApi } from "../baseApi";

export interface AddeventsResponse {
	success: boolean;
	message: string;
	event_id: string;
}

export interface RegisterEventResponse {
	success: boolean;
	message: string;
}

export interface GeteventsResponse {
	success: boolean;
	count: number;
	total: number;
	next_page: boolean;
	next_key: string | null;
	data: events[];
}
export interface GeteventSingleResponse {
	success: boolean;
	count: number;
	total: number;
	next_page: boolean;
	next_key: string | null;
	data: events;
}
export interface events {
	event_slug: string;
	event_venue_zip: string;
	created_at: string;
	event_active_flg: boolean;
	event_venue_state: string;
	event_venue_city: string;
	org_id: string;
	event_id: string;
	event_venue_address_ln2: string;
	event_venue_address_ln1: string;
	event_alt_date: string;
	event_date: string;
	event_name: string;
	event_mode: string;
	event_broadcast_link: string;
	rate_plans: [
		{
			created_at: string;
			rate_plan_cd: string;
			rate_plan_id: string;
			rate_plan_name: string;
			rate_plan_cost: string;
			eff_date: string;
			end_date: string;
			plan_details: string;
		}
	]
}

export interface AddUpdateResponse {
	success: boolean;
	message: string;
}

export interface AddDeleteResponse {
	success: boolean;
	message: string;
}

export interface GetRegisteredResponse {
	success: boolean;
	next_page: boolean;
	next_key: string;
	total_items: number;
	data: [{
		email: string;
		createdAt: string;
		event_reg_num: number;
		event_id: string;
		primary_guest_name: string;
		primary_guest_ph: string;
		is_member: boolean;
		member_id: string;
		payment_mode: string;
		total_amount: number;
		additional_donation: number;
		additional_donation_type: string;
		veg_count: number;
		non_veg_count: number;
		address_street: string;
		address_city: string;
		address_state: string;
		address_zip: string;
		selected_plans: [{
			event_reg_num: string;
			rate_plan_id: string;
			registered_pax_count: number;
			active_flg: boolean;
			refund_flg: boolean;
			created_at: string;
			updated_at: string;
		}];
	}]
}

export const listingApi = baseApi
	.enhanceEndpoints({
		addTagTypes: ["add-events", "get-events", "edit-events", "delete-events", "register-events", "get-registered-events"],
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
				GeteventsResponse | GeteventSingleResponse,
				{
					search?: string;
					page?: number;
					limit?: number;
					event_slug?: string;
					current_date?: string;
					lastKey?: string;
				}
			>({
				query: ({ search = "", limit = "", lastKey = "", current_date = "", event_slug = "" }) => ({
					url: "/events",
					method: "GET",
					params: {
						search,
						limit,
						lastKey,
						current_date,
						event_slug
					},
					headers: {
						"Content-Type": "application/json",
					},

					// credentials: "include",
				}),
				providesTags: ["get-events"],
			}),
			getSingleEvent: builder.query<
				GeteventSingleResponse,
				{

					event_slug?: string;
					current_date?: string;
				}
			>({
				query: ({ current_date = "", event_slug = "" }) => ({
					url: "/events",
					method: "GET",
					params: {

						current_date,
						event_slug
					},
					headers: {
						"Content-Type": "application/json",
					},

					// credentials: "include",
				}),
				providesTags: ["get-events"],
			}),

			registerEvent: builder.mutation<RegisterEventResponse, unknown>({
				query: (data) => ({
					url: "/register-event",
					method: "POST",
					body: data,
					// credentials: "include",
				}),
				invalidatesTags: ["register-events","get-registered-events"],
			}),
			editRegisteredEvent: builder.mutation<AddUpdateResponse, { event_reg_num: string; data: unknown }>({
				query: ({ event_reg_num, data }) => ({
					url: `/register-event`,
					method: "PUT",
					params: { event_reg_num },
					body: data,
				}),
				invalidatesTags: ["get-registered-events"],
			}),
			getRegisteredEvent: builder.query<GetRegisteredResponse, string>({
				query: (event_id) => ({
					url: "/register-event",
					method: "GET",
					params: {
						event_id
					},
					// credentials: "include",
				}),
				providesTags: ["get-registered-events"],
			}),
			deleteRegisteredEvent: builder.mutation<AddDeleteResponse, string>({
				query: (event_reg_num) => ({
					url: `/register-event`,
					method: "DELETE",
					params: {
						event_reg_num
					},
					headers: {
						"Content-Type": "application/json",
					},
					// credentials: "include",
				}),
				invalidatesTags: ["get-registered-events"],
			}),
		}),
	});

export const {
	useAddeventsMutation,
	useGeteventsQuery,
	useEditeventsMutation,
	useDeleteeventsMutation,
	useGetSingleEventQuery,
	useRegisterEventMutation,
	useEditRegisteredEventMutation,
	useGetRegisteredEventQuery,
	useDeleteRegisteredEventMutation
} = listingApi;
