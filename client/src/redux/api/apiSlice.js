import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Vercel uses the env variable, Local uses localhost
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  }),
  // Registered all domain tags for automatic cache invalidation
  tagTypes: ["Product", "User", "Order", "Customer", "Dashboard"],

  endpoints: (builder) => ({
    // ==========================================
    // 1. PRODUCT MODULE
    // ==========================================
    getProducts: builder.query({
      query: ({
        search = "",
        page = 1,
        sortBy = "createdAt",
        order = "desc",
      }) =>
        `products?search=${search}&page=${page}&sortBy=${sortBy}&order=${order}`,
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
      invalidatesTags: ["Product", "Dashboard"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `products/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "Dashboard"],
    }),

    // ==========================================
    // 2. CUSTOMER MODULE (CRM)
    // ==========================================
    getCustomers: builder.query({
      query: ({
        search = "",
        page = 1,
        sortBy = "createdAt",
        order = "desc",
      }) =>
        `customers?search=${search}&page=${page}&sortBy=${sortBy}&order=${order}`,
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
      invalidatesTags: ["Customer", "Dashboard"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `customers/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Customer", "Dashboard"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: `customers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Customer", "Dashboard"],
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
    // 4. SYSTEM UTILITIES
    // ==========================================
    importGenericData: builder.mutation({
      query: ({ type, formData }) => ({
        url: `data/import/${type}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product", "User", "Order", "Customer", "Dashboard"],
    }),
    getDashboardData: builder.query({
      query: (search = "") => `dashboard/stats?search=${search}`,
      providesTags: ["Order", "Product", "Customer", "Dashboard"],
    }),
  }),
});

// Final Export List - DO NOT CHANGE THESE NAMES
export const {
  // Product Hooks
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Customer Hooks
  useGetCustomersQuery,
  useGetCustomerQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,

  // Order Hooks
  useGetOrdersQuery,
  useAddOrderMutation,
  useAddPaymentMutation,
  useGetOrderQuery,
  useUpdateOrderMutation,

  // System & Dashboard Hooks
  useImportGenericDataMutation,
  useGetDashboardDataQuery,
} = apiSlice;
