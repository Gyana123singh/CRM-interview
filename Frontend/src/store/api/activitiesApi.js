import { apiSlice } from "./apiSlice";

export const activitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query({
      query: (params) => ({
        url: "/activities",
        params: {
          leadId: params?.leadId || undefined,
          dealId: params?.dealId || undefined,
          customerId: params?.customerId || undefined,
          status: params?.status || undefined,
          activityType: params?.activityType || undefined,
          page: params?.page || 1,
          limit: params?.limit || 30
        }
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Activity", id })),
              { type: "Activity", id: "LIST" }
            ]
          : [{ type: "Activity", id: "LIST" }]
    }),

    createActivity: builder.mutation({
      query: (body) => ({
        url: "/activities",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Activity", id: "LIST" }, "Notification", "Dashboard"]
    }),

    updateActivityStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/activities/${id}/status`,
        method: "PATCH",
        body: { status }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Activity", id },
        { type: "Activity", id: "LIST" },
        "Dashboard"
      ]
    })
  })
});

export const {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityStatusMutation
} = activitiesApi;
