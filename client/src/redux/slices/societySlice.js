import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { societyAPI } from '../../api/societyAPI';

export const fetchSocieties = createAsyncThunk(
  'society/fetchSocieties',
  async (_, { rejectWithValue }) => {
    try {
      const res = await societyAPI.getAllSocieties();
      return res.data.societies;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch societies');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'society/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const res = await societyAPI.getDashboardStats(params);
      return res.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

const societySlice = createSlice({
  name: 'society',
  initialState: {
    societies: [],
    currentSociety: null,
    stats: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentSociety: (state, action) => {
      state.currentSociety = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocieties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSocieties.fulfilled, (state, action) => {
        state.loading = false;
        state.societies = action.payload;
      })
      .addCase(fetchSocieties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { setCurrentSociety } = societySlice.actions;
export default societySlice.reducer;
