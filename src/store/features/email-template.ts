import { baseApi } from "../baseApi";

interface AddTemplate {
	success: boolean;
	error: boolean;
	message: string;
	data: {
		name: string;
		subject: string;
		body: string;
	};
}
interface getTemplates {
	success: boolean;
	data: [
		{
			id: string;
			name: string;
			subject: string;
			body: string;
			updatedAt: Date;
			createdAt: Date;
		},
	];
}

export const listingApi = baseApi
	.enhanceEndpoints({
		addTagTypes: [
			"add-Templates",
			"get-Templates",
			"edit-Templates",
			"delete-Templates",
			"send-email",
		],
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			addTemplates: builder.mutation<
				AddTemplate,
				{ name: string; subject: string; body: string }
			>({
				query: ({ name, subject, body }) => ({
					url: "/email-template",
					method: "POST",
					body: { name, subject, body },
					// credentials: "include",
				}),
				invalidatesTags: ["add-Templates"],
			}),
			editTemplates: builder.mutation<
				AddTemplate,
				{ name: string; subject: string; body: string; id: string }
			>({
				query: ({ name, subject, body, id }) => ({
					url: `/email-template`,
					method: "PUT",
					body: { name, subject, body },
					params: {
						id,
					},
					headers: {
						"Content-Type": "application/json",
					},
					// credentials: "include",
				}),
				invalidatesTags: ["edit-Templates"],
			}),
			getTemplates: builder.query<
				getTemplates,
				{
					search?: string;
				}
			>({
				query: ({ search = "" }) => ({
					url: "/email-template",
					method: "GET",
					params: {
						search,
					},
					headers: {
						"Content-Type": "application/json",
					},
					// credentials: "include",
				}),
				providesTags: ["get-Templates"],
			}),
			deleteTemplates: builder.mutation<AddTemplate, { id: string }>({
				query: ({ id }) => ({
					url: `/email-template`,
					method: "DELETE",
					params: {
						id,
					},
					headers: {
						"Content-Type": "application/json",
					},
					// credentials: "include",
				}),
				invalidatesTags: ["delete-Templates"],
			}),
			sendEmail: builder.mutation<
				AddTemplate,
				{ recipientIds: string[]; subject: string; body: string }
			>({
				query: ({ recipientIds, subject, body }) => ({
					url: "/send-email",
					method: "POST",
					body: { recipientIds, subject, body },
					// credentials: "include",
				}),
				invalidatesTags: ["send-email"],
			}),
		}),
	});
export const {
	useAddTemplatesMutation,
	useGetTemplatesQuery,
	useEditTemplatesMutation,
	useDeleteTemplatesMutation,
	useSendEmailMutation,
} = listingApi;
