import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Ensure this matches the Key you put in Vercel
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  }),
  // Registered all domain tags for automatic cache invalidation
  tagTypes: ["Product", "User", "Order", "Customer"],

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
        `/products?search=${search}&page=${page}&sortBy=${sortBy}&order=${order}`,
      providesTags: ["Product"],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ["Product"],
    }),
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
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
        `/customers?search=${search}&page=${page}&sortBy=${sortBy}&order=${order}`,
      providesTags: ["Customer"],
    }),
    getCustomer: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: ["Customer"],
    }),
    addCustomer: builder.mutation({
      query: (newCustomer) => ({
        url: "/customers",
        method: "POST",
        body: newCustomer,
      }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: `/customers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Customer"],
    }),

    // ==========================================
    // 3. ORDER & SALES MODULE
    // ==========================================
    getOrders: builder.query({
      query: (params) => ({ url: "/orders", params }), // PLURAL
      providesTags: ["Order"],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`, // SINGULAR
      providesTags: ["Order"],
    }),
    addOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order", "Product", "Customer"],
    }),
    updateOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Order", "Product", "Customer"],
    }),
    addPayment: builder.mutation({
      query: ({ id, amount }) => ({
        url: `/orders/${id}/payment`,
        method: "PUT",
        body: { amount },
      }),
      invalidatesTags: ["Order", "Customer"],
    }),
    // ==========================================
    // 4. SYSTEM UTILITIES
    // ==========================================
    importGenericData: builder.mutation({
      query: ({ type, formData }) => ({
        url: `/data/import/${type}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product", "User", "Order", "Customer"],
    }),
    getDashboardData: builder.query({
      // Passing the search string into the URL
      query: (search = "") => `/dashboard/stats?search=${search}`,
      providesTags: ["Order", "Product", "Customer"],
    }),
  }),
});

// Structured Exports for clean importing in components
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

  // System Hooks
  useImportGenericDataMutation,

  // Dashboard Hooks
  useGetDashboardDataQuery,
} = apiSlice;
