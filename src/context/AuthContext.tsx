import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface User {
  id: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  emailVerified?: boolean;
  addresses?: Address[];
  createdAt?: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  updateProfile: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase is not configured. Please set up your Supabase credentials.');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: any) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const newProfile = {
            id: supabaseUser.id,
            role: supabaseUser.email === 'admin@bwitty.com' ? 'admin' : 'user',
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            setLoading(false);
            return;
          }

          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            role: newProfile.role,
            emailVerified: supabaseUser.email_confirmed_at != null,
            createdAt: supabaseUser.created_at,
          });
        } else {
          console.error('Error loading profile:', error);
          setLoading(false);
          return;
        }
      } else {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          emailVerified: supabaseUser.email_confirmed_at != null,
          createdAt: supabaseUser.created_at,
        });
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase is not configured. Cannot login.');
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase is not configured. Cannot register.');
      return false;
    }

    // Validate password requirements on backend
    const passwordRequirements = [
      { test: (pwd: string) => /[A-Z]/.test(pwd), message: 'Password must contain at least one uppercase letter' },
      { test: (pwd: string) => /[a-z]/.test(pwd), message: 'Password must contain at least one lowercase letter' },
      { test: (pwd: string) => /\d/.test(pwd), message: 'Password must contain at least one number' },
      { test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), message: 'Password must contain at least one symbol' },
      { test: (pwd: string) => pwd.length >= 8, message: 'Password must be at least 8 characters long' },
    ];

    for (const requirement of passwordRequirements) {
      if (!requirement.test(data.password)) {
        console.error('Password validation failed:', requirement.message);
        return false;
      }
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    if (!user || !isSupabaseConfigured || !supabase) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        return false;
      }

      // Update local user state
      const updatedUser = {
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };
      
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      updateProfile,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};