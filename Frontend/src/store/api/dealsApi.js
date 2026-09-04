import { apiSlice } from "./apiSlice";

export const dealsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query({
      query: (params) => ({
        url: "/deals",
        params: {
          page: params?.page || 1,
          limit: params?.limit || 100,
          search: params?.search || undefined,
          stage: params?.stage || undefined,
          assignedAgentId: params?.assignedAgentId || undefined,
          sortBy: params?.sortBy || "createdAt",
          sortOrder: params?.sortOrder || "desc"
        }
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Deal", id })),
              { type: "Deal", id: "LIST" }
            ]
          : [{ type: "Deal", id: "LIST" }]
    }),

    getDealById: builder.query({
      query: (id) => `/deals/${id}`,
      providesTags: (result, error, id) => [{ type: "Deal", id }]
    }),

    createDeal: builder.mutation({
      query: (body) => ({
        url: "/deals",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Deal", id: "LIST" }, "Dashboard"]
    }),

    updateDealStage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/deals/${id}/stage`,
        method: "PATCH",
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Deal", id },
        { type: "Deal", id: "LIST" },
        "Dashboard",
        "Activity"
      ]
    }),

    updateDeal: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/deals/${id}`,
        method: "PATCH",
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Deal", id },
        { type: "Deal", id: "LIST" },
        "Dashboard"
      ]
    }),

    deleteDeal: builder.mutation({
      query: (id) => ({
        url: `/deals/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "Deal", id: "LIST" }, "Dashboard"]
    }),

    importDealsCSV: builder.mutation({
      query: (body) => ({
        url: "/deals/import",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Deal", id: "LIST" }, "Dashboard"]
    })
  })
});

export const {
  useGetDealsQuery,
  useGetDealByIdQuery,
  useCreateDealMutation,
  useUpdateDealStageMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
  useImportDealsCSVMutation
} = dealsApi;
