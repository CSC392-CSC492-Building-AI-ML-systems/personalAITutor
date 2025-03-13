"use client";

import { useState } from 'react';

type AuthFormProps = {
    setToken: (token: string | null) => void; // Explicitly define the type
  };

const AuthForm: React.FC<AuthFormProps> = ({ setToken }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFormData({ username: '', email: '', password: '' });
    setMessage('');
  };

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setMessage('');

    const url = isRegister ? 'http://127.0.0.1:5000/register' : 'http://127.0.0.1:5000/login';
    const body = isRegister ? formData : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Success');
        if (!isRegister && data.access_token) {
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token);
        }
      } else {
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setMessage('Error: Unable to process request.');
    }
  };

  return (
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        {isRegister && <input type="text" name="username" placeholder="Username" onChange={handleChange} required />}
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={toggleMode}>
        {isRegister ? 'Already have an account? Login' : 'New here? Register'}
      </button>
    </div>
  );
};

export default AuthForm;
