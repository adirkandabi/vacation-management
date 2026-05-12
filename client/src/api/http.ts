import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.toString() || 'http://localhost:3000'

export const http = axios.create({
  baseURL,
})

export function setUserIdHeader(userId: number | null) {
  if (userId && Number.isFinite(userId)) {
    http.defaults.headers.common['X-User-Id'] = String(userId)
  } else {
    delete http.defaults.headers.common['X-User-Id']
  }
}

