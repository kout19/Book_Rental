import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import * as jwt_decode from 'jwt-decode';

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // Initialize auth from stored token once on mount
  useEffect(() => {
    const init = () => {
      const token = Cookies.get('token') || localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setReady(true)
        return
      }
      try {
        const decoded = jwt_decode(token)
        setUser(decoded)
      } catch {
        setUser(null)
      }
      setReady(true)
    }
    init()
  }, [])

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
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
