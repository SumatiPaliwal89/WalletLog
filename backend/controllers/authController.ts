import { supabase } from '../config/supabase';
import { Request, Response , NextFunction } from 'express';


export const signup = async (req: Request, res: Response) => {
  const { email, password, first_name, last_name, middle_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError || !authData.user) {
    return res.status(400).json({ error: authError?.message || 'Signup failed' });
  }

  const userId = authData.user.id;
  const { error: dbError } = await supabase.from('users').insert({
    id: userId,
    email: email.toLowerCase(),
    first_name,
    last_name,
    middle_name: middle_name || null,
    created_at: new Date(),
    updated_at: new Date()
  });

  if (dbError) {
    await supabase.auth.admin.deleteUser(userId);
    return res.status(500).json({ error: dbError.message });
  }

  res.json({ message: 'Signup successful! Please verify your email.'});
};


export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void>=> {
  try{
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({ 
    message: 'Login successful', 
    access_token: data.session?.access_token, 
    refresh_token: data.session?.refresh_token,
  });
} catch(error){
  next(error);
}
};
