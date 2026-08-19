import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { fetchNotifications } from './redux/slices/notificationSlice';
import { fetchMe } from './redux/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications());
      if (!user) {
        dispatch(fetchMe());
      }
    }
  }, [token, dispatch]);

  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '16px',
                fontSize: '13px',
                border: '1px solid #334155',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
