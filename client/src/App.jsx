import React, { useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import Preview from './pages/Preview';
import Login from './pages/Login';

import api from './configs/api';
import { login, setLoading, logout } from './app/features/authSlice';

const App = () => {
  const dispatch = useDispatch();

  const getUserData = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    try {
      // NOTE: '/api/user/data' must match server routes (confirm mount path in server.js)
      const { data } = await api.get('/api/user/data');

      if (data.user) {
        dispatch(login({ token, user: data.user }));
      } else {
        dispatch(logout());
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      dispatch(logout());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="builder/:resumeId" element={<ResumeBuilder />} />
        </Route>

        <Route path="/view/:resumeId" element={<Preview />} />
      </Routes>
    </>
  );
};

export default App;
