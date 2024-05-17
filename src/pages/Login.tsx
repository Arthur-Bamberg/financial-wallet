import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import '../global.css';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      const result = await axios.post<{ access_token: string }>(
        'http://localhost:3000/auth/login',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);

      Cookies.set('access_token', result.data.access_token, {
        expires: inOneHour,
      });

      navigate('/assets');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          alert(`Login failed: ${error.response.data.message}`);
        } else if (error.request) {
          alert('Login failed: No response from server');
        } else {
          alert('Login failed: Request setup error');
        }
      } else {
        alert('Login failed: An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="w-96 p-8 bg-gray-800 rounded-lg shadow-lg text-white"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1 block w-full bg-gray-700 text-white border-none"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-1 block w-full bg-gray-700 text-white border-none"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded"
        >
          Log In
        </Button>
      </form>
    </div>
  );
};
