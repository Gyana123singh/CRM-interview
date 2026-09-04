import { apiSlice } from "./apiSlice";

export const customersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({
        url: "/customers",
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          search: params?.search || undefined,
          sortBy: params?.sortBy || "createdAt",
          sortOrder: params?.sortOrder || "desc"
        }
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Customer", id })),
              { type: "Customer", id: "LIST" }
            ]
          : [{ type: "Customer", id: "LIST" }]
    }),

    getCustomerById: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: "Customer", id }]
    }),

    createCustomer: builder.mutation({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }]
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/customers/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" }
      ]
    }),

    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }]
    }),

    importCustomersCSV: builder.mutation({
      query: (body) => ({
        url: "/customers/import",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }, "Dashboard"]
    })
  })
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useImportCustomersCSVMutation
} = customersApi;
