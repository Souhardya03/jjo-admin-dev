import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

interface IResponse {
	token: string;
	message: string;
	success: boolean;
	error: boolean;
}
interface IOTP {
	message: string;
	success: boolean;
	error: boolean;
}

interface IRegister {
	success: boolean;
	error: boolean;
	message: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	token: string;
}
interface IGOOGLE {
	url: string;
}

interface IUser {
	success: boolean;
	error: boolean;
	message: string;
	data: {
		id: number;
		name: string;
		email: string;
		profileImage: string;
		phone: string;
		city: string;
		birthDate: Date;
	};
}

interface Ilogin {
	success: boolean;
	error: boolean;
	message: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	token: string;
}

export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL,
		prepareHeaders: (headers) => {
			const token = Cookies.get("auth-token");
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: [
		"login",
		"logout",
		"register",
		"user",
		"sendOtp",
		"verifyOtp",
		"resetPass",
		"getProfile",
		"updateProfile",
		"googlelogin",
		"googleregister",
	],
	endpoints: (builder) => ({
		login: builder.mutation<Ilogin, unknown>({
			query: ({ email, password }) => ({
				url: "/admin",
				method: "POST",
				body: { email, password },
			}),
			invalidatesTags: ["login"],
		}),
		register: builder.mutation<IRegister, unknown>({
			query: ({ name, email, password, dob }) => ({
				url: "/auth/register",
				method: "POST",
				body: { name, email, password, dob },
			}),
			invalidatesTags: ["register"],
		}),
		logout: builder.mutation<IResponse, void>({
			query: () => ({
				url: "/auth/logout",
				method: "POST",
			}),
			invalidatesTags: ["logout"],
		}),
		sendOtp: builder.mutation<IOTP, string>({
			query: (email) => ({
				url: "/auth/forgotpassword",
				method: "POST",
				body: { email },
			}),
			invalidatesTags: ["sendOtp"],
		}),
		verifyOtp: builder.mutation<IOTP, { email: string; otp: string }>({
			query: ({ email, otp }) => ({
				url: "/auth/verifyOtp",
				method: "POST",
				body: { email, otp },
			}),
			invalidatesTags: ["verifyOtp"],
		}),
		resetPass: builder.mutation<IOTP, { email: string; newPassword: string }>({
			query: ({ email, newPassword }) => ({
				url: "/auth/resetpassword",
				method: "PATCH",
				body: { email, newPassword },
			}),
			invalidatesTags: ["resetPass"],
		}),
		getProfile: builder.query<IUser, void>({
			query: () => ({
				url: "/auth/my-profile",
				method: "GET",
				credentials: "include",
			}),
			providesTags: ["getProfile"],
		}),
		updateProfile: builder.mutation<IResponse, unknown>({
			query: (data) => ({
				url: "/auth/update-profile",
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["updateProfile"],
		}),
		googleAuth: builder.query<IGOOGLE, unknown>({
			query: () => ({
				url: "/auth/google",
				method: "GET",
			}),
			providesTags: ["googleregister"],
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useLogoutMutation,
	useSendOtpMutation,
	useVerifyOtpMutation,
	useResetPassMutation,
	useGetProfileQuery,
	useUpdateProfileMutation,
	useGoogleAuthQuery,
} = baseApi;
