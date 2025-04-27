
import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, UserPlus, User } from "lucide-react";
import { toast } from "sonner";

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
}

const AuthForm = ({ isLogin, onToggleMode }: AuthFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }

      const payload = isLogin ? {
        email: formData.email,
        password: formData.password
      } : {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      const response = await axios.post(`http://localhost:3000${endpoint}`, payload);
      console.log(response.data.access_token);

      if (isLogin) {
        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          toast.success('Welcome back!');
          navigate('/'); // go to dashboard after login
        }
      } else {
        toast.success('Signup successful! Please verify your email.');
        navigate('/'); // or maybe redirect to login page after signup
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="cyber-card p-6 animate-scale-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="glass-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="glass-input pl-10"
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40" />
            <Input
              type="email"
              name="email"
              placeholder="student@university.edu"
              value={formData.email}
              onChange={handleChange}
              className="glass-input pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40" />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="glass-input pl-10"
              required
            />
          </div>
        </div>

        {!isLogin && (
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40" />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="glass-input pl-10"
                required
              />
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-neon-blue to-vibrant-purple hover:from-vibrant-purple hover:to-neon-blue transition-all duration-300"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-pulse">Processing...</div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {isLogin ? (
                <>Login</>
              ) : (
                <>Sign Up <UserPlus className="w-4 h-4" /></>
              )}
            </div>
          )}
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-neon-blue hover:text-vibrant-purple transition-colors text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
