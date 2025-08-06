import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  address_id: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  orders: Order[];
  ordersLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State and supabase must be declared before any hooks or usages
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const supabase = getSupabaseClient();
  // Fetch all orders for current user
  const refreshOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    setOrders(data || []);
    setOrdersLoading(false);
  };
  // Refresh user from session
  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const userData = await fetchUser(session.user.id);
    setUser(userData);
    setLoading(false);
  };
  // Initial user and orders fetch on mount
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  // Fetch orders whenever user changes
  useEffect(() => {
    if (user) {
      refreshOrders();
    } else {
      setOrders([]);
    }
    // eslint-disable-next-line
  }, [user]);
  // ...existing code...

  // Fetch user from users table
  const fetchUser = async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as User;
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      // Only set role to 'user' if user does not exist yet
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();
      if (!existingUser) {
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: 'user'
          }
        ]);
      } else {
        // Update name/email only, do not overwrite role
        await supabase.from('users').update({
          email: data.user.email,
          full_name: fullName
        }).eq('id', data.user.id);
      }
    }
    setLoading(false);
    // Redirect to sign-in page (handled in page logic)
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      const userData = await fetchUser(data.user.id);
      if (!userData) {
        setError('User record not found. Please contact support.');
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(userData);
      setLoading(false);
      // Redirect to homepage (handled in page logic)
    } else {
      setError('No user returned from sign-in.');
      setUser(null);
      setLoading(false);
    }
  };

  // Sign in/up with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // After redirect, handle session in callback page
    setLoading(false);
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  // Listen for auth state changes (for Google callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Unified user record: upsert with Google info
          // Only set role to 'user' if user does not exist yet
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();
          if (!existingUser) {
            await supabase.from('users').insert([
              {
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.email,
                role: 'user'
              }
            ]);
          } else {
            // Update name/email only, do not overwrite role
            await supabase.from('users').update({
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email
            }).eq('id', session.user.id);
          }
          const userData = await fetchUser(session.user.id);
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.role === 'admin';
  const value: AuthContextType = {
    user,
    loading,
    error,
    orders,
    ordersLoading,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshUser,
    refreshOrders,
  };

  // Always render children, expose loading/error in context for use in pages/components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}