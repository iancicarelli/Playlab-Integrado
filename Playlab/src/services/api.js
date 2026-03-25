const API_URL = 'http://localhost:8080'

export const getAuthHeader = () => {
  const token = localStorage.getItem('jwt_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/log-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) throw new Error('Login failed')
    const data = await response.json()
    if (data.status && data.jwt) {
      localStorage.setItem('jwt_token', data.jwt)
      localStorage.setItem('username', data.username)
    }
    return data
  },

  async register(username, password) {
    const response = await fetch(`${API_URL}/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        roleRequest: {
          roleListName: ['PLAYER'],
        },
      }),
    })
    if (!response.ok) throw new Error('Registration failed')
    const data = await response.json()
    if (data.status && data.jwt) {
      localStorage.setItem('jwt_token', data.jwt)
      localStorage.setItem('username', data.username)
    }
    return data
  },

  logout() {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('username')
  },

  async postScore(gameId, score) {
    const response = await fetch(`${API_URL}/api/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ gameId, score }),
    })
    if (!response.ok) throw new Error('Failed to post score')
    return response.json()
  },

  async getLeaderboard(gameId, limit = 15) {
    const response = await fetch(
      `${API_URL}/api/scores/leaderboard?gameId=${gameId}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      },
    )
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    return response.json()
  },

  isAuthenticated() {
    return !!localStorage.getItem('jwt_token')
  },
}

// Game IDs mapping
export const GAME_IDS = {
  DINO_RUSH: 1,
  SNAKE: 2,
  SIMON_GESTURE: 3,
  UFO_EVADER: 4,
}
