import { createContext, useContext, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';

// Mock session and user to completely bypass Supabase Auth login
const MOCK_USER: User = {
  id: 'demo-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@agentarena.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { first_name: 'Demo', last_name: 'User' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_SESSION: Session = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: MOCK_USER,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: MOCK_SESSION,
  user: MOCK_USER,
  signOut: async () => {},
  isLoading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session] = useState<Session | null>(MOCK_SESSION);
  const [user] = useState<User | null>(MOCK_USER);
  const [isLoading] = useState(false);

  const signOut = async () => {
    console.log("Mock sign out completed.");
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

