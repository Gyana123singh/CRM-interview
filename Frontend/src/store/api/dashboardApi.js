import { apiSlice } from "./apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/admin/dashboard/stats",
      providesTags: ["Dashboard"]
    }),

    getLeadSources: builder.query({
      query: () => "/admin/dashboard/lead-sources",
      providesTags: ["Dashboard"]
    }),

    getReports: builder.query({
      query: () => "/admin/reports",
      providesTags: ["Dashboard"]
    })
  })
});

export const {
  useGetDashboardStatsQuery,
  useGetLeadSourcesQuery,
  useGetReportsQuery
} = dashboardApi;
