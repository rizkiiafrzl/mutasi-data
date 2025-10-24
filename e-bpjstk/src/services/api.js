// API Service for E-BPJS Ketenagakerjaan
import { 
  mockWorkers, 
  mockNonaktifWorkers,
  mockReportPeriods, 
  mockUploadHistory, 
  mockReportSummary, 
  mockApiResponses,
  simulateApiCall,
  simulateError
} from './mockData.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const USE_MOCK_DATA = true // Set to false to use real API

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('token')
    this.useMockData = USE_MOCK_DATA
  }

  // Set authentication token
  setToken(token) {
    this.token = token
    localStorage.setItem('token', token)
  }

  // Clear authentication token
  clearToken() {
    this.token = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options,
    }

    console.log('API Service - Making request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    })

    try {
      const response = await fetch(url, config)
      console.log('API Service - Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      // gracefully handle empty bodies (e.g., 204 No Content)
      const contentType = response.headers.get('content-type') || ''
      let data
      if (response.status === 204 || contentType.indexOf('application/json') === -1) {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      } else {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      }

      if (!response.ok) {
        const message = (data && (data.error || data.message)) || `HTTP error! status: ${response.status}`
        console.error('API Service - Request failed:', {
          status: response.status,
          statusText: response.statusText,
          message,
          data
        })
        throw new Error(message)
      }

      console.log('API Service - Request successful:', data)
      // return parsed json (or null) so callers can decide
      return data
    } catch (error) {
      console.error('API Service - Request error:', {
        message: error.message,
        stack: error.stack,
        url,
        config
      })
      throw error
    }
  }

  // Authentication endpoints
  async register(userData) {
    if (this.useMockData) {
      console.log('Mock API: Register user', userData)
      return await simulateApiCall(mockApiResponses.register)
    }
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    if (this.useMockData) {
      console.log('Mock API: Login user', credentials)
      const response = await simulateApiCall(mockApiResponses.login)
      
      // Store token and user data
      if (response.token) {
        this.setToken(response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('loginTime', Date.now().toString())
      }
      
      return response
    }
    
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // Store token and user data
    if (response.token) {
      this.setToken(response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('loginTime', Date.now().toString())
    }

    return response
  }

  async logout() {
    if (this.useMockData) {
      console.log('Mock API: Logout user')
      this.clearToken()
      return await simulateApiCall({ message: 'Logout berhasil' })
    }
    
    try {
      await this.request('/logout', {
        method: 'POST',
      })
    } finally {
      this.clearToken()
    }
  }

  // User profile endpoints
  async getProfile() {
    if (this.useMockData) {
      console.log('Mock API: Get profile')
      return await simulateApiCall(mockUser)
    }
    return this.request('/profile')
  }

  async updateProfile(profileData) {
    if (this.useMockData) {
      console.log('Mock API: Update profile', profileData)
      return await simulateApiCall({ ...mockUser, ...profileData, message: 'Profile berhasil diupdate' })
    }
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Farm management endpoints
  async getFarms() {
    if (this.useMockData) {
      console.log('Mock API: Get farms')
      return await simulateApiCall([])
    }
    return this.request('/farms')
  }

  async createFarm(farmData) {
    if (this.useMockData) {
      console.log('Mock API: Create farm', farmData)
      return await simulateApiCall({ id: Math.floor(Math.random() * 1000), ...farmData, message: 'Farm berhasil dibuat' })
    }
    return this.request('/farms', {
      method: 'POST',
      body: JSON.stringify(farmData),
    })
  }

  async getFarm(id) {
    if (this.useMockData) {
      console.log('Mock API: Get farm', id)
      return await simulateApiCall({ id, name: 'Mock Farm', message: 'Farm ditemukan' })
    }
    return this.request(`/farms/${id}`)
  }

  async updateFarm(id, farmData) {
    if (this.useMockData) {
      console.log('Mock API: Update farm', id, farmData)
      return await simulateApiCall({ id, ...farmData, message: 'Farm berhasil diupdate' })
    }
    return this.request(`/farms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(farmData),
    })
  }

  async deleteFarm(id) {
    if (this.useMockData) {
      console.log('Mock API: Delete farm', id)
      return await simulateApiCall({ message: 'Farm berhasil dihapus' })
    }
    return this.request(`/farms/${id}`, {
      method: 'DELETE',
    })
  }

  // reCAPTCHA validation
  async validateRecaptcha(recaptchaToken) {
    if (this.useMockData) {
      console.log('Mock API: Validate reCAPTCHA', recaptchaToken)
      return await simulateApiCall({ success: true, message: 'reCAPTCHA valid' })
    }
    return this.request('/auth/validate-recaptcha', {
      method: 'POST',
      body: JSON.stringify({ recaptchaToken }),
    })
  }

  // Health check
  async healthCheck() {
    if (this.useMockData) {
      console.log('Mock API: Health check')
      return await simulateApiCall(mockApiResponses.healthCheck)
    }
    return this.request('/health', {
      method: 'GET',
    })
  }

  // Report Periods
  async getReportPeriods({ page = 1, pageSize = 10, status = 'all' } = {}) {
    if (this.useMockData) {
      console.log('Mock API: Get report periods', { page, pageSize, status })
      let filteredData = mockReportPeriods
      
      if (status !== 'all') {
        filteredData = mockReportPeriods.filter(rp => rp.status === status)
      }
      
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const items = filteredData.slice(startIndex, endIndex)
      
      return await simulateApiCall({
        items,
        total: filteredData.length,
        page,
        pageSize
      })
    }
    
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), status })
    return this.request(`/report-periods?${qs.toString()}`, { method: 'GET' })
  }

  async createReportPeriod(payload = {}) {
    if (this.useMockData) {
      console.log('Mock API: Create report period', payload)
      const response = mockApiResponses.createReportPeriod
      mockReportPeriods.push(response)
      return await simulateApiCall(response)
    }
    
    return this.request('/report-periods', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async deleteReportPeriod(id) {
    if (this.useMockData) {
      console.log('Mock API: Delete report period', id)
      const index = mockReportPeriods.findIndex(rp => rp.id == id)
      if (index !== -1) {
        mockReportPeriods.splice(index, 1)
        return await simulateApiCall(mockApiResponses.deleteReportPeriod)
      }
      return await simulateApiCall({ error: 'Report period not found' })
    }
    
    return this.request(`/report-periods/${id}`, { method: 'DELETE' })
  }

  async calculateReportPeriod(id) {
    if (this.useMockData) {
      console.log('Mock API: Calculate report period', id)
      return await simulateApiCall(mockApiResponses.calculateReportPeriod)
    }
    
    return this.request(`/report-periods/${id}/calculate`, { method: 'POST' })
  }

  async finalizeReportPeriod(id) {
    if (this.useMockData) {
      console.log('Mock API: Finalize report period', id)
      const index = mockReportPeriods.findIndex(rp => rp.id == id)
      if (index !== -1) {
        mockReportPeriods[index].status = 'Posting'
      }
      return await simulateApiCall(mockApiResponses.finalizeReportPeriod)
    }
    
    return this.request(`/report-periods/${id}/finalize`, { method: 'POST' })
  }

  async printReportPeriod(id) {
    if (this.useMockData) {
      console.log('Mock API: Print report period', id)
      return await simulateApiCall(mockApiResponses.printReportPeriod)
    }
    
    return this.request(`/report-periods/${id}/print`, { method: 'GET' })
  }

  // Dashboard summary
  async getReportSummary() {
    if (this.useMockData) {
      console.log('Mock API: Get report summary')
      return await simulateApiCall(mockReportSummary)
    }
    
    return this.request('/report-periods-summary', { method: 'GET' })
  }

  // Upload Workers (mass upload)
  async uploadWorkers(file) {
    if (this.useMockData) {
      console.log('Mock API: Upload workers', file.name)
      return await simulateApiCall(mockApiResponses.uploadWorkers)
    }
    
    const form = new FormData()
    form.append('file', file)
    // Don't set Content-Type explicitly; let browser set multipart boundary
    return fetch(`${this.baseURL}/workers/upload`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: form,
    }).then(async (res) => {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `HTTP error! status: ${res.status}`
        throw new Error(message)
      }
      return data
    })
  }

  // Upload TK (Tenaga Kerja)
  async uploadTK(file) {
    if (this.useMockData) {
      console.log('Mock API: Upload TK', file.name)
      return await simulateApiCall(mockApiResponses.uploadTK)
    }
    
    const form = new FormData()
    form.append('file', file)
    // Don't set Content-Type explicitly; let browser set multipart boundary
    return fetch(`${this.baseURL}/workers/upload-tk`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: form,
    }).then(async (res) => {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `HTTP error! status: ${res.status}`
        throw new Error(message)
      }
      return data
    })
  }

  // Upload TK NA (Tenaga Kerja Nonaktif)
  async uploadTKNA(file) {
    if (this.useMockData) {
      console.log('Mock API: Upload TK NA', file.name)
      return await simulateApiCall(mockApiResponses.uploadTK)
    }
    
    const form = new FormData()
    form.append('file', file)
    const url = `${this.baseURL}/workers/upload-tk-na`
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    return fetch(url, {
      method: 'POST',
      headers,
      body: form,
    }).then(async (res) => {
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch { data = { message: text } }
      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `HTTP error! status: ${res.status}`
        throw new Error(message)
      }
      return data
    })
  }

  // Upload Upah (Wage Data)
  async uploadUpah(file) {
    if (this.useMockData) {
      console.log('Mock API: Upload upah', file.name)
      return await simulateApiCall(mockApiResponses.uploadUpah)
    }
    
    const form = new FormData()
    form.append('file', file)
    // Don't set Content-Type explicitly; let browser set multipart boundary
    return fetch(`${this.baseURL}/workers/upload-upah`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: form,
    }).then(async (res) => {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `HTTP error! status: ${res.status}`
        throw new Error(message)
      }
      return data
    })
  }

  // Koreksi TK (Correction of Worker Data)
  async koreksiTK(file) {
    if (this.useMockData) {
      console.log('Mock API: Koreksi TK', file.name)
      return await simulateApiCall(mockApiResponses.koreksiTK)
    }
    
    const form = new FormData()
    form.append('file', file)
    // Don't set Content-Type explicitly; let browser set multipart boundary
    return fetch(`${this.baseURL}/koreksi-data-tk`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: form,
    }).then(async (res) => {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `HTTP error! status: ${res.status}`
        throw new Error(message)
      }
      return data
    })
  }

  async getUploadHistory() {
    if (this.useMockData) {
      console.log('Mock API: Get upload history')
      return await simulateApiCall(mockUploadHistory)
    }
    
    return this.request('/workers/upload-history', { method: 'GET' })
  }

  async downloadErrorFile(id) {
    if (this.useMockData) {
      console.log('Mock API: Download error file', id)
      // Simulate file download
      const blob = new Blob(['Mock error file content'], { type: 'text/plain' })
      return blob
    }
    
    const url = `${this.baseURL}/workers/upload-history/${id}/download`
    const config = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    }
    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      return response.blob() // Return blob for file download
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async deleteUploadHistory(id) {
    if (this.useMockData) {
      console.log('Mock API: Delete upload history', id)
      const index = mockUploadHistory.findIndex(item => item.id == id)
      if (index !== -1) {
        mockUploadHistory.splice(index, 1)
        return await simulateApiCall({ message: 'Upload history berhasil dihapus' })
      }
      return await simulateApiCall({ error: 'Upload history not found' })
    }
    
    console.log('API Service - deleteUploadHistory called with ID:', id)
    console.log('API Service - baseURL:', this.baseURL)
    console.log('API Service - token:', this.token ? 'Present' : 'Missing')
    
    const result = await this.request(`/workers/upload-history/${id}`, {
      method: 'DELETE',
    })
    
    console.log('API Service - deleteUploadHistory result:', result)
    return result
  }

  // Workers
  async getWorkers() {
    if (this.useMockData) {
      console.log('Mock API: Get workers')
      return await simulateApiCall(mockWorkers)
    }
    return this.request('/workers', { method: 'GET' })
  }

  async getNonaktifWorkers() {
    if (this.useMockData) {
      console.log('Mock API: Get nonaktif workers')
      return await simulateApiCall(mockNonaktifWorkers)
    }
    return this.request('/workers/nonaktif', { method: 'GET' })
  }

  async getAllWorkers() {
    if (this.useMockData) {
      console.log('Mock API: Get all workers (aktif + nonaktif)')
      const allWorkers = [...mockWorkers, ...mockNonaktifWorkers]
      return await simulateApiCall(allWorkers)
    }
    return this.request('/workers/all', { method: 'GET' })
  }

  async getWorker(id) {
    if (this.useMockData) {
      console.log('Mock API: Get worker', id)
      const allWorkers = [...mockWorkers, ...mockNonaktifWorkers]
      const worker = allWorkers.find(w => w.id == id)
      return await simulateApiCall(worker || { error: 'Worker not found' })
    }
    return this.request(`/workers/${id}`, { method: 'GET' })
  }

  async createWorker(worker) {
    if (this.useMockData) {
      console.log('Mock API: Create worker', worker)
      const response = mockApiResponses.createWorker(worker)
      // Add to mock data
      mockWorkers.push(response)
      return await simulateApiCall(response)
    }
    
    return this.request('/workers', {
      method: 'POST',
      body: JSON.stringify(worker),
    })
  }

  async updateWorker(id, worker) {
    if (this.useMockData) {
      console.log('Mock API: Update worker', id, worker)
      const allWorkers = [...mockWorkers, ...mockNonaktifWorkers]
      const index = allWorkers.findIndex(w => w.id == id)
      if (index !== -1) {
        // Update di array yang sesuai
        if (index < mockWorkers.length) {
          mockWorkers[index] = { ...mockWorkers[index], ...worker }
        } else {
          const nonaktifIndex = index - mockWorkers.length
          mockNonaktifWorkers[nonaktifIndex] = { ...mockNonaktifWorkers[nonaktifIndex], ...worker }
        }
        return await simulateApiCall(mockApiResponses.updateWorker(id, worker))
      }
      return await simulateApiCall({ error: 'Worker not found' })
    }
    
    return this.request(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(worker),
    })
  }

  async deleteWorker(id) {
    if (this.useMockData) {
      console.log('Mock API: Delete worker', id)
      const allWorkers = [...mockWorkers, ...mockNonaktifWorkers]
      const index = allWorkers.findIndex(w => w.id == id)
      if (index !== -1) {
        // Delete dari array yang sesuai
        if (index < mockWorkers.length) {
          mockWorkers.splice(index, 1)
        } else {
          const nonaktifIndex = index - mockWorkers.length
          mockNonaktifWorkers.splice(nonaktifIndex, 1)
        }
        return await simulateApiCall(mockApiResponses.deleteWorker)
      }
      return await simulateApiCall({ error: 'Worker not found' })
    }
    
    return this.request(`/workers/${id}`, {
      method: 'DELETE',
    })
  }

  // Method untuk mengubah status worker menjadi nonaktif
  async setWorkerNonaktif(id, data) {
    if (this.useMockData) {
      console.log('Mock API: Set worker nonaktif', id, data)
      const workerIndex = mockWorkers.findIndex(w => w.id == id)
      if (workerIndex !== -1) {
        const worker = mockWorkers[workerIndex]
        // Pindahkan dari aktif ke nonaktif
        const nonaktifWorker = {
          ...worker,
          status: 'nonaktif',
          upah: 0,
          rapel: 0,
          upahPokok: 0,
          tanggalNonaktif: data.tanggalNonaktif || new Date().toISOString().split('T')[0],
          alasanNonaktif: data.alasanNonaktif || 'Nonaktif'
        }
        mockNonaktifWorkers.push(nonaktifWorker)
        mockWorkers.splice(workerIndex, 1)
        return await simulateApiCall({ message: 'Worker berhasil dinonaktifkan' })
      }
      return await simulateApiCall({ error: 'Worker not found' })
    }
    
    return this.request(`/workers/${id}/nonaktif`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Method untuk mengaktifkan kembali worker
  async setWorkerAktif(id) {
    if (this.useMockData) {
      console.log('Mock API: Set worker aktif', id)
      const workerIndex = mockNonaktifWorkers.findIndex(w => w.id == id)
      if (workerIndex !== -1) {
        const worker = mockNonaktifWorkers[workerIndex]
        // Pindahkan dari nonaktif ke aktif
        const aktifWorker = {
          ...worker,
          status: 'aktif',
          tanggalNonaktif: undefined,
          alasanNonaktif: undefined
        }
        mockWorkers.push(aktifWorker)
        mockNonaktifWorkers.splice(workerIndex, 1)
        return await simulateApiCall({ message: 'Worker berhasil diaktifkan kembali' })
      }
      return await simulateApiCall({ error: 'Worker not found' })
    }
    
    return this.request(`/workers/${id}/aktif`, {
      method: 'POST',
    })
  }
}

// Create singleton instance
const apiService = new ApiService()

export default apiService
