import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rules: [],
};

const automationSlice = createSlice({
  name: "automation",
  initialState,
  reducers: {
    setRules: (state, action) => {
      state.rules = action.payload;
    },
    addRule: (state, action) => {
      state.rules.unshift(action.payload);
    },
    toggleRuleStatus: (state, action) => {
      const rule = state.rules.find((r) => r.id === action.payload.id);
      if (rule) {
        rule.status = rule.status === "active" ? "paused" : "active";
      }
    },
    deleteRule: (state, action) => {
      state.rules = state.rules.filter((r) => r.id !== action.payload.id);
    },
  },
});

export const { setRules, addRule, toggleRuleStatus, deleteRule } = automationSlice.actions;
export default automationSlice.reducer;
