import { createContext, useContext, useState } from 'react'
import Cookies from 'js-cookie'
import * as jwt_decode from 'jwt-decode';

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = Cookies.get('token')
    if (!token) return null

    try {
      const decoded = jwt_decode(token)
      return decoded // example: { id, email, role, exp }
    } catch {
      return null
    }
  })

  const login = (token) => {
    Cookies.set('token', token, {
      expires: 1, // 1 day
      sameSite: 'Strict',
      secure: true,
    })

    try {
      const decoded = jwt_decode(token)
      setUser(decoded)
    } catch {
      setUser(null)
    }
  }

  const logout = () => {
    Cookies.remove('token')
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
