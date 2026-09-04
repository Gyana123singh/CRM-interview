import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  activeRole: "team",
  isAuthenticated: false,
  loading: false,
  isMobileSidebarOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      let userData = action.payload;
      if (userData && (userData.companyName === "Infotattva Business Solutions" || userData.companyName === "Infotattva Portal" || !userData.companyName)) {
        userData = { ...userData, companyName: "CRM Sales Management System" };
      }
      state.user = userData;
      state.isAuthenticated = !!userData;
      if (userData?.role) {
        const rawRole = userData.role;
        state.activeRole = (rawRole === "client-admin" || rawRole === "super-admin") ? "admin" : rawRole;
      } else if (!state.activeRole) {
        state.activeRole = "team";
      }
    },
    setActiveRole: (state, action) => {
      const rawRole = action.payload;
      state.activeRole = (rawRole === "client-admin" || rawRole === "super-admin") ? "admin" : rawRole;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.activeRole = "team";
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebarOpen = !state.isMobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.isMobileSidebarOpen = action.payload;
    },
  },
});

export const { setUser, setActiveRole, logout, toggleMobileSidebar, setMobileSidebarOpen } = authSlice.actions;
export default authSlice.reducer;
