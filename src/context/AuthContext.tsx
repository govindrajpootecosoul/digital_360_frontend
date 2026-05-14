import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../lib/api'
import { clearAccessToken, getAccessToken, setAccessToken } from '../lib/authStorage'

export type AuthUser = {
  id: string
  email: string
  displayName: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, redirectTo?: string) => Promise<void>
  signup: (email: string, password: string, displayName?: string, redirectTo?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const refreshUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await apiGet<{ user: AuthUser }>('/auth/me')
      setUser(res.user)
    } catch {
      clearAccessToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string, redirectTo = '/') => {
      const res = await apiPost<{ token: string; user: AuthUser }>('/auth/login', {
        email: email.trim(),
        password,
      })
      setAccessToken(res.token)
      setUser(res.user)
      const safe =
        redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/'
      navigate(safe, { replace: true })
    },
    [navigate],
  )

  const signup = useCallback(
    async (email: string, password: string, displayName?: string, redirectTo = '/') => {
      const res = await apiPost<{ token: string; user: AuthUser }>('/auth/register', {
        email: email.trim(),
        password,
        displayName: displayName?.trim() || undefined,
      })
      setAccessToken(res.token)
      setUser(res.user)
      const safe =
        redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/'
      navigate(safe, { replace: true })
    },
    [navigate],
  )

  const logout = useCallback(() => {
    clearAccessToken()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
