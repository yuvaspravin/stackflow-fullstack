import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // VERCEL TIP: Ensure VITE_API_URL in Vercel dashboard ends with /api
    // Example: https://stockflow-backend.onrender.com/api
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  }),
  tagTypes: ["Product", "User", "Order", "Customer", "Dashboard"],

  endpoints: (builder) => ({
    // ==========================================
    // 1. PRODUCT MODULE
    // ==========================================
    getProducts: builder.query({
      query: (params) => ({ url: "products", params }), // Removed leading slash
      providesTags: ["Product"],
    }),
    getProduct: builder.query({
      query: (id) => `products/${id}`,
      providesTags: ["Product"],
    }),
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `products/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),

    // ==========================================
    // 2. CUSTOMER MODULE (CRM)
    // ==========================================
    getCustomers: builder.query({
      query: (params) => ({ url: "customers", params }),
      providesTags: ["Customer"],
    }),
    getCustomer: builder.query({
      query: (id) => `customers/${id}`,
      providesTags: ["Customer"],
    }),
    addCustomer: builder.mutation({
      query: (newCustomer) => ({
        url: "customers",
        method: "POST",
        body: newCustomer,
      }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `customers/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: `customers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Customer"],
    }),

    // ==========================================
    // 3. ORDER & SALES MODULE
    // ==========================================
    getOrders: builder.query({
      query: (params) => ({ url: "orders", params }),
      providesTags: ["Order"],
    }),
    getOrder: builder.query({
      query: (id) => `orders/${id}`,
      providesTags: ["Order"],
    }),
    addOrder: builder.mutation({
      query: (body) => ({ url: "orders", method: "POST", body }),
      invalidatesTags: ["Order", "Product", "Customer", "Dashboard"],
    }),
    updateOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Order", "Product", "Customer", "Dashboard"],
    }),
    addPayment: builder.mutation({
      query: ({ id, amount }) => ({
        url: `orders/${id}/payment`,
        method: "PUT",
        body: { amount },
      }),
      invalidatesTags: ["Order", "Customer", "Dashboard"],
    }),

    // ==========================================
    // 4. SYSTEM & DASHBOARD
    // ==========================================
    getDashboardData: builder.query({
      // Removed the leading / before dashboard
      query: (search = "") => `dashboard/stats?search=${search}`,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCustomersQuery,
  useGetCustomerQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetOrdersQuery,
  useAddOrderMutation,
  useAddPaymentMutation,
  useGetOrderQuery,
  useUpdateOrderMutation,
  useGetDashboardDataQuery,
} = apiSlice;
