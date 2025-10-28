import { createContext, useContext, useState } from 'react'
import Cookies from 'js-cookie'
import * as jwt_decode from 'jwt-decode';

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = Cookies.get('token') || localStorage.getItem('token')
    if (!token) return null

    try {
      const decoded = jwt_decode(token)
      return decoded // example: { id, email, role, exp }
    } catch {
      return null
    }
  })

  // token: JWT string (Firebase ID token). extra: optional object with additional user info (e.g., role)
  const login = (token, extra = {}) => {
    const isProd = import.meta.env.PROD;
    Cookies.set('token', token, {
      expires: 1, // 1 day
      sameSite: isProd ? 'Strict' : 'Lax',
      secure: !!isProd,
    })
    // also store a fallback in localStorage for dev
    try {
      localStorage.setItem('token', token);
    } catch {
      // ignore localStorage write errors in restricted environments
    }

    try {
      const decoded = jwt_decode(token) || {};
      // merge decoded JWT payload with any extra user info (role, name, etc.)
      setUser({ ...decoded, ...extra });
    } catch {
      setUser(extra || null);
    }
  }

  const logout = () => {
    Cookies.remove('token')
    try { localStorage.removeItem('token'); } catch {
      // ignore
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
