import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintAPI } from '../../api/allAPIs';

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (params, { rejectWithValue }) => {
    try {
      const res = await complaintAPI.getComplaints(params);
      return res.data.complaints;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch complaints');
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedComplaint: null
  },
  reducers: {
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    addLiveComplaint: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateLiveComplaint: (state, action) => {
      const index = state.items.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedComplaint?._id === action.payload._id) {
        state.selectedComplaint = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedComplaint, addLiveComplaint, updateLiveComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
