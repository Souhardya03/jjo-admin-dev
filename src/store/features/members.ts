import { baseApi } from "../baseApi";


export interface Member {
  UUID: string;
  FamilyId: string;
  MemberId: string;

  Name: string;
  EmailAddress: string;
  PhoneNo: string;

  Gender: "Male" | "Female" | string;
  DOB: string;

  Activity: "Active" | "Inactive" | string;

  City: string;
  State: string;
  Street: string;
  Zip: string;

  WhatsappGroupMember: boolean;
  SendEmail: boolean;

  Amount: number;
  ForYear: string;

  TransactionDate: string;
  DepositDate: string;

  Comments?: string;
}


export interface Pagination {
  page: number;
  limit: number;
  hasNextPage: boolean;
}


export interface AddMembersResponse {
  success: boolean;
  error: boolean;
  message: string;
  FamilyId: string;
  MemberId: string;
  UUID: string;
}

export interface GetMembersResponse {
  success: boolean;
  error: boolean;
  message: string;
  members: Member[];
  hasNextPage: boolean;
  lastKey: string;
  totalItems: number;
  totalPages: number
  totalMembers: number
}

export interface DeleteInviteCodeResponse {
  success: boolean;
  error: boolean;
  message: string;
}

export interface CreateInviteCodeResponse {
  success: boolean;
  error: boolean;
  message: string;
  code: string;
}

export interface GetInviteCodesResponse {
  success: boolean
  count: number
  codes: Code[]
}

export interface Code {
  Expiry: string
  code: string
  MaxUses: number
  UsedCount: number
  CreatedAt: string
}



export const listingApi = baseApi
  .enhanceEndpoints({
    addTagTypes: [
      "add-members",
      "get-members",
      "edit-members",
      "delete-members",
      "get-codes",
      "create-code",
      "delete-code"
    ],
  })
  .injectEndpoints({
    endpoints: (builder) => ({

      addMembers: builder.mutation<AddMembersResponse, unknown>({
        query: (data) => ({
          url: "/members",
          method: "POST",
          body: data,
          // credentials: "include",
        }),
        invalidatesTags: ["add-members", "get-members"],
      }),

      registerMembers: builder.mutation<AddMembersResponse, unknown>({
        query: (data) => ({
          url: "/members/register",
          method: "POST",
          body: data,
          // credentials: "include",
        }),
        invalidatesTags: ["add-members", "get-members"],
      }),


      editMembers: builder.mutation<
        AddMembersResponse,
        { data: unknown }
      >({
        query: ({ data }) => ({
          url: `/members`,
          method: "PUT",
          body: data,
          // credentials: "include",
        }),
        invalidatesTags: ["edit-members", "get-members"],
      }),


      deleteMember: builder.mutation<
        AddMembersResponse, { familyId: string, memberId: string }
      >({
        query: ({ familyId, memberId }) => ({
          url: `/members`,
          method: "DELETE",
          params: {
            familyId,
            memberId
          },
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
        }),
        invalidatesTags: ["delete-members", "get-members"],
      }),


      getMembers: builder.query<
        GetMembersResponse,
        {
          search?: string;
          page?: number;
          limit?: number;
          status?: string;
          lastKey?: string;
        }
      >({
        query: ({ search = "", limit = "", status = "", lastKey = "" }) => ({
          url: "/members",
          method: "GET",
          params: {
            search,
            limit,
            status,
            lastKey,
          },
          headers: {
            "Content-Type": "application/json",
          },

          // credentials: "include",
        }),
        providesTags: ["get-members"],
      }),
      createInviteCode: builder.mutation<
        AddMembersResponse, { days: number, maxUses: number }
      >({
        query: ({ days, maxUses }) => ({
          url: `/members/invite-code`,
          method: "POST",
          params: {
            days,
            maxUses
          },
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
        }),
        invalidatesTags: ["create-code", "get-codes"],
      }),

      getInviteCodes: builder.query<
        GetInviteCodesResponse,
        void
      >({
        query: () => ({
          url: "/members/invite-code",
          method: "GET",

          headers: {
            "Content-Type": "application/json",
          },

          // credentials: "include",
        }),
        providesTags: ["get-codes"],
      }),
      deleteInviteCode: builder.mutation<
        DeleteInviteCodeResponse, { code: string }
      >({
        query: ({ code }) => ({
          url: `/members/invite-code`,
          method: "DELETE",
          body: {
            code
          },
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
        }),
        invalidatesTags: ["delete-code", "get-codes"],
      }),
    }),
  });

export const {
  useAddMembersMutation,
  useGetMembersQuery,
  useEditMembersMutation,
  useDeleteMemberMutation,
  useCreateInviteCodeMutation,
  useGetInviteCodesQuery,
  useDeleteInviteCodeMutation,
  useRegisterMembersMutation,
} = listingApi;
