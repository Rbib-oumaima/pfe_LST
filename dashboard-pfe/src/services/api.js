import axios from 'axios'

// =====================
// INSTANCE AXIOS
// =====================

const API = axios.create({

  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000',

  timeout: 60000,
})


// =====================
// AJOUT JWT AUTOMATIQUE
// =====================

API.interceptors.request.use((config) => {

  const token = localStorage.getItem('token')

  if (token) {

    config.headers.Authorization =
      `Bearer ${token}`
  }

  return config
})


// =====================
// SENSOR SERVICE
// =====================

export const sensorService = {

  // ðŸ”¥ Live sensors

  getLive: (ligne = null) => {

    return API.get('/sensors/live', {

      params:
        ligne ? { ligne } : {}

    }).then(res => res.data)
  },

  // ðŸ“Š Historique capteur

  getHistory: (
    sensor_id,
    limit = 100
  ) => {

    return API.get('/sensors/history', {

      params: {
        sensor_id,
        limit
      }

    }).then(res => res.data)
  },

  // ðŸ“ Liste lignes

  getLines: () => {

    return API.get('/sensors/lines')

      .then(res => res.data)
  }
}


// =====================
// ALERT SERVICE
// =====================

export const alertService = {

  getActive: () => {

    return API.get('/alerts/active')

      .then(res => res.data)
  }
}


// =====================
// INCIDENT SERVICE
// =====================

export const incidentService = {

  list: (status, ligne) => {

    return API.get('/incidents/', {

      params: {
        status,
        ligne
      }

    }).then(res => res.data)
  },

  update: (
    id,
    status,
    action_taken
  ) => {

    return API.patch(`/incidents/${id}`, {

      status,
      action_taken

    }).then(res => res.data)
  }
}


// =====================
// AI SERVICE
// =====================

export const aiService = {

  query: (question) => {

    return API.post('/ai/query', {

      question

    }).then(res => res.data)
  }
}


// =====================
// THRESHOLD SERVICE
// =====================

export const thresholdService = {

  list: () => {

    return API.get('/thresholds/')
      .then(res => res.data)
  },

  create: (data) => {

    return API.post('/thresholds/', data)
      .then(res => res.data)
  },

 
  delete: (id) => {

    return API.delete(`/thresholds/${id}`)
      .then(res => res.data)
  }
}
// =====================
// USER SERVICE
// =====================

export const userService = {

  getAll: () => {
    return API.get('/users/')
      .then(res => res.data)
  },
  getMe: () => {
  return API.get("/users/me")
    .then(res => res.data)
},

  create: (data) => {
    return API.post('/users/', data)
      .then(res => res.data)
  },

  delete: (id) => {
    return API.delete(`/users/${id}`)
      .then(res => res.data)
  },
  update: (id, data) => {
  return API.put(`/users/${id}`, data)
    .then(res => res.data)
},
}