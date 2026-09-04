import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leads: [],
  filterStatus: "All",
  filterSource: "All",
  searchQuery: "",
  selectedLeadId: null,
};

const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload;
    },
    addLead: (state, action) => {
      state.leads.unshift(action.payload);
    },
    updateLeadStatus: (state, action) => {
      const lead = state.leads.find((l) => l.id === action.payload.id);
      if (lead) {
        lead.status = action.payload.status;
      }
    },
    updateLeadNotes: (state, action) => {
      const lead = state.leads.find((l) => l.id === action.payload.id);
      if (lead) {
        lead.notes = action.payload.notes;
      }
    },
    updateLeadFollowUp: (state, action) => {
      const lead = state.leads.find((l) => l.id === action.payload.id);
      if (lead) {
        lead.followUpDate = action.payload.date;
      }
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterSource: (state, action) => {
      state.filterSource = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedLeadId: (state, action) => {
      state.selectedLeadId = action.payload;
    },
  },
});

export const {
  setLeads,
  addLead,
  updateLeadStatus,
  updateLeadNotes,
  updateLeadFollowUp,
  setFilterStatus,
  setFilterSource,
  setSearchQuery,
  setSelectedLeadId,
} = leadSlice.actions;

export default leadSlice.reducer;
