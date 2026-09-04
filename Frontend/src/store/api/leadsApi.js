import { apiSlice } from "./apiSlice";

export const leadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params) => ({
        url: "/leads",
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          search: params?.search || undefined,
          status: params?.status || undefined,
          source: params?.source || undefined,
          priority: params?.priority || undefined,
          assignedToId: params?.assignedToId || undefined,
          sortBy: params?.sortBy || "createdAt",
          sortOrder: params?.sortOrder || "desc"
        }
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return {
            success: true,
            data: {
              items: response,
              pagination: { page: 1, limit: response.length, total: response.length, totalPages: 1 }
            }
          };
        }
        return response;
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Lead", id })),
              { type: "Lead", id: "LIST" }
            ]
          : [{ type: "Lead", id: "LIST" }]
    }),

    getLeadById: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: "Lead", id }]
    }),

    getAgents: builder.query({
      query: () => "/admin/agents",
      providesTags: ["Agent"]
    }),

    createLead: builder.mutation({
      query: (body) => ({
        url: "/leads",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Lead", id: "LIST" }, "Dashboard"]
    }),

    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        "Dashboard"
      ]
    }),

    updateLeadPriority: builder.mutation({
      query: ({ id, priority }) => ({
        url: `/leads/${id}/priority`,
        method: "PATCH",
        body: { priority }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        "Dashboard"
      ]
    }),

    updateLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        "Dashboard"
      ]
    }),

    updateLeadNotes: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/leads/${id}/notes`,
        method: "PATCH",
        body: { notes }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Lead", id }, { type: "Lead", id: "LIST" }]
    }),

    assignLead: builder.mutation({
      query: ({ id, agentId }) => ({
        url: `/leads/${id}/assign`,
        method: "PATCH",
        body: { agentId }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" }
      ]
    }),

    convertLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/convert`,
        method: "POST",
        body
      }),
      invalidatesTags: [
        { type: "Lead", id: "LIST" },
        { type: "Customer", id: "LIST" },
        { type: "Deal", id: "LIST" },
        "Dashboard",
        "Activity"
      ]
    })
  })
});

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useGetAgentsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useUpdateLeadPriorityMutation,
  useUpdateLeadStatusMutation,
  useUpdateLeadNotesMutation,
  useAssignLeadMutation,
  useConvertLeadMutation
} = leadsApi;
