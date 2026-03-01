import { baseApi } from "../baseApi";

export interface AddratesResponse {
	success: boolean;
	message: string;
	rate_plan_id: string;
}

export interface GetratesResponse {
	success: boolean;
	count: number;
	total: number;
	next_page: boolean;
	next_key: string | null;
	data: rates[];
}
export interface rates {
	child_amount: number;
	created_at: string;
	adult_amount: number;
	end_date: string;
	child_count: number;
	rate_plan_code: string;
	adult_count: number;
	rate_plan_name: string;
	effective_date: string;
	rate_plan_id: string;
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
		addTagTypes: ["add-rates", "get-rates", "edit-rates", "delete-rates"],
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			addrates: builder.mutation<AddratesResponse, unknown>({
				query: (data) => ({
					url: "/rates",
					method: "POST",
					body: data,
					// credentials: "include",
				}),
				invalidatesTags: ["add-rates", "get-rates"],
			}),

			editrates: builder.mutation<
				AddUpdateResponse,
				{ rate_plan_id: string; data: unknown }
			>({
				query: ({ rate_plan_id, data }) => ({
					url: `/rates`,
					method: "PUT",
					params: {
						rate_plan_id,
					},
					body: data,
					// credentials: "include",
				}),
				invalidatesTags: ["edit-rates", "get-rates"],
			}),

			deleterates: builder.mutation<AddDeleteResponse, string>({
				query: (rate_plan_id) => ({
					url: `/rates`,
					method: "DELETE",
					params: {
						rate_plan_id,
					},
					headers: {
						"Content-Type": "application/json",
					},
					// credentials: "include",
				}),
				invalidatesTags: ["delete-rates", "get-rates"],
			}),

			getrates: builder.query<
				GetratesResponse,
				{
					search?: string;
					page?: number;
					limit?: number;

					lastKey?: string;
				}
			>({
				query: ({ search = "", limit = "", lastKey = "" }) => ({
					url: "/rates",
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
				providesTags: ["get-rates"],
			}),
		}),
	});

export const {
	useAddratesMutation,
	useGetratesQuery,
	useEditratesMutation,
    useDeleteratesMutation,
} = listingApi;
