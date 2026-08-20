import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addLiveNotification } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Connected to real-time socket server');
      if (user?.societyId?._id || user?.societyId) {
        const sId = user.societyId._id || user.societyId;
        newSocket.emit('join_society', sId);
      }
    });

    newSocket.on('notification_received', (data) => {
      dispatch(addLiveNotification(data));
      toast((t) => (
        <div className="flex items-start gap-2">
          <span className="text-xl">📢</span>
          <div>
            <p className="font-semibold text-sm">{data.title}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{data.message}</p>
          </div>
        </div>
      ), { duration: 6000 });
    });

    newSocket.on('complaint_created', (data) => {
      if (user?.role === 'society_admin' || user?.role === 'staff') {
        toast.info(`🔔 New complaint raised: "${data.title}"`, { icon: '🛠️' });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
