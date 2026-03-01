import { baseApi } from "../baseApi";

export interface AddorganizationsResponse {
	success: boolean;
	error: boolean;
	message: string;
	org_id: string;
	org_slug: string;
}

export interface GetorganizationsResponse {
	success: boolean;
	count: number;
	total: number;
	next_page: boolean;
	next_key: string | null;
	data: Organizations[];
}
export interface Organizations {
	updated_at: string;
	org_id: string;
	org_name: string;
	created_at: string;
	org_slug: string;
	org_type: string;
}

export interface AddUpdateResponse {
	success: boolean;
	message: string;
	data: UpdatedData;
}
export interface UpdatedData {
	updated_at: string;
	org_id: string;
	org_name: string;
	created_at: string;
	org_slug: string;
	org_type: string;
}

export interface AddDeleteResponse {
	success: boolean;
	message: string;
}

export const listingApi = baseApi
	.enhanceEndpoints({
		addTagTypes: [
			"add-organizations",
			"get-organizations",
			"edit-organizations",
			"delete-organizations",
		],
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			addorganizations: builder.mutation<AddorganizationsResponse, unknown>({
				query: (data) => ({
					url: "/organizations",
					method: "POST",
					body: data,
					// credentials: "include",
				}),
				invalidatesTags: ["add-organizations", "get-organizations"],
			}),

			editorganizations: builder.mutation<
				AddUpdateResponse,
				{ org_id: string; data: unknown }
			>({
				query: ({ org_id, data }) => ({
					url: `/organizations`,
					method: "PUT",
					params: {
						org_id,
					},
					body: data,
					// credentials: "include",
				}),
				invalidatesTags: ["edit-organizations", "get-organizations"],
			}),

			deleteorganization: builder.mutation<AddDeleteResponse, string>({
				query: (org_id) => ({
					url: `/organizations`,
					method: "DELETE",
					params: {
						org_id,
					},
					headers: {
						"Content-Type": "application/json",
					},
					// credentials: "include",
				}),
				invalidatesTags: ["delete-organizations", "get-organizations"],
			}),

			getorganizations: builder.query<
				GetorganizationsResponse,
				{
					search?: string;
					page?: number;
					limit?: number;

					lastKey?: string;
				}
			>({
				query: ({ search = "", limit = "", lastKey = "" }) => ({
					url: "/organizations",
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
				providesTags: ["get-organizations"],
			}),
		}),
	});

export const {
	useAddorganizationsMutation,
	useGetorganizationsQuery,
	useEditorganizationsMutation,
	useDeleteorganizationMutation,
} = listingApi;
