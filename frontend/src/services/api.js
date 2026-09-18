const API_URL = import.meta.env.VITE_API_URL || '/api';
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

export const api = {
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    register: async (data) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  },
  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  },
  tickets: {
    getAll: async (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_URL}/tickets?${query}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    getOne: async (ticketNumber) => {
      const res = await fetch(`${API_URL}/tickets/${ticketNumber}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    updateDetails: async (ticketNumber, data) => {
      const res = await fetch(`${API_URL}/tickets/${ticketNumber}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    updateStatus: async (ticketNumber, status) => {
      const res = await fetch(`${API_URL}/tickets/${ticketNumber}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    updateAssignee: async (ticketNumber, assignee) => {
      const res = await fetch(`${API_URL}/tickets/${ticketNumber}/assignee`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ assignee }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    getActivity: async (ticketNumber) => {
      const res = await fetch(`${API_URL}/tickets/${ticketNumber}/activity`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  },
  ai: {
    chat: async (message) => {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  },
  users: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  }
};
