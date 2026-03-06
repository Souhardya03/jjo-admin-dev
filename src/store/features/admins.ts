import { baseApi } from "../baseApi";

interface AddAdmin {
    success: boolean;
    message: string;
}
interface getAdmins {
    success: boolean;
    count: number;
    admins: [
        {
            admin_id: string;
            name: string;
            email: string;
            phone: string;
            status: string;
        },
    ];
}

export const listingApi = baseApi
    .enhanceEndpoints({
        addTagTypes: [
            "add-Admin",
            "get-Admin",
            "edit-Admin",
            "delete-Admin",
        ],
    })
    .injectEndpoints({
        endpoints: (builder) => ({
            addAdmin: builder.mutation<
                AddAdmin,
                { name: string; email: string, password: string, role?: string, status?: string }
            >({
                query: ({ name, email, password, role, status }) => ({
                    url: "/admin/register",
                    method: "POST",
                    body: { name, email, password, role, status },
                    // credentials: "include",
                }),
                invalidatesTags: ["add-Admin", "get-Admin"],
            }),
            editAdmin: builder.mutation<
                AddAdmin,
                { email: string; name?: string; password?: string; role?: string; status?: string; old_password?: string; new_password?: string; }
            >({
                query: (body) => ({
                    url: `/admin`,
                    method: "PUT",
                    body,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // credentials: "include",
                }),
                invalidatesTags: ["edit-Admin", "get-Admin"],
            }),
            getAdmins: builder.query<
                getAdmins,
                {
                    search?: string;
                }
            >({
                query: ({ search = "" }) => ({
                    url: "/admin",
                    method: "GET",
                    params: {
                        search,
                    },
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // credentials: "include",
                }),
                providesTags: ["get-Admin"],
            }),
            deleteAdmin: builder.mutation<AddAdmin, { email: string }>({
                query: ({ email }) => ({
                    url: `/admin`,
                    method: "DELETE",
                    body: { email },
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // credentials: "include",
                }),
                invalidatesTags: ["delete-Admin", "get-Admin"],
            }),

        }),
    });
export const {
    useAddAdminMutation,
    useGetAdminsQuery,
    useEditAdminMutation,
    useDeleteAdminMutation,
} = listingApi;
