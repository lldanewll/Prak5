import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import axios from 'axios';

const Protected = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/protected', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Ошибка при получении данных');
      }
    };

    fetchProtectedData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Защищенная страница
        </Typography>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : data ? (
          <>
            <Typography variant="body1" gutterBottom>
              {data.message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Пользователь: {data.user.username}
            </Typography>
          </>
        ) : (
          <Typography>Загрузка...</Typography>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          sx={{ mt: 3 }}
        >
          Выйти
        </Button>
      </Box>
    </Container>
  );
};

export default Protected; 