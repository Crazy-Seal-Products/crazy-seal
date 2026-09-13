const AUTH_CALLBACK_TYPES = new Set([
  'recovery',
  'invite',
  'signup',
  'magiclink',
  'email',
])

function paramsFromHashOrSearch(value: string): URLSearchParams {
  return new URLSearchParams(value.replace(/^#/, ''))
}

export function getAuthCallbackError(hash = '', search = ''): { code: string; message: string } | null {
  const params = paramsFromHashOrSearch(hash)
  const searchParams = new URLSearchParams(search)
  const code = params.get('error_code') || searchParams.get('error_code') || ''
  const raw =
    params.get('error_description') ||
    searchParams.get('error_description') ||
    params.get('error') ||
    searchParams.get('error')
  if (!code && !raw) return null
  if (!params.get('error') && !searchParams.get('error') && !code) return null

  const description = raw ? raw.replace(/\+/g, ' ') : ''
  if (code === 'otp_expired' || /invalid or has expired/i.test(description)) {
    return {
      code: code || 'otp_expired',
      message: 'This email link is invalid or has expired. Request a new reset link and open it right away.',
    }
  }

  return {
    code: code || 'auth_error',
    message: description || 'This sign-in link could not be used. Request a new one.',
  }
}

export function hasAuthHash(hash: string): boolean {
  const params = paramsFromHashOrSearch(hash)
  if (params.get('error') && (params.get('error_code') || params.get('error_description'))) return true
  if (params.get('access_token') && params.get('refresh_token')) return true
  const type = params.get('type')
  return Boolean(type && AUTH_CALLBACK_TYPES.has(type))
}

export function hasAuthSearch(search: string, pathname = '/'): boolean {
  const params = new URLSearchParams(search)
  if (params.get('token_hash') && params.get('type')) return true
  if (!params.get('code')) return false
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return normalized === '/' || normalized === '/admin'
}

export function isPublicAdminAuthPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return normalized === '/admin/login' || normalized === '/admin/reset-password'
}

export function resetPasswordPath(search = '', hash = ''): string {
  return `/admin/reset-password/${search}${hash}`
}
