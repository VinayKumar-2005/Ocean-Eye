import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  reports: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- Async Thunks ---

// Fetch all reports
export const fetchReports = createAsyncThunk('reports/fetchReports', async () => {
  const response = await axios.get('/api/reports');
  return response.data;
});

// Create a new report
export const createReport = createAsyncThunk('reports/createReport', async (reportData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.post('/api/reports', reportData, config);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});


const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    reset: (state) => {
        state.status = 'idle';
        state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { reset } = reportSlice.actions;
export default reportSlice.reducer;