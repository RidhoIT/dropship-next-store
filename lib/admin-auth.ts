'use client'

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem('adminLoggedIn') === 'true'
  } catch {
    return false
  }
}

export function logoutAdmin() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem('adminLoggedIn')
    window.location.href = '/admin/login'
  } catch {
    window.location.href = '/admin/login'
  }
}

