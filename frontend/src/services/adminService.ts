import { AdminUser, DashboardStats, PendingEmployer, Job } from '../types/admin';

class AdminService {
  private baseUrl = 'http://localhost:3001/api/admin';

  private getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async login(email: string, password: string, adminLevel: string): Promise<AdminUser> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, adminLevel }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    return data.admin;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${this.baseUrl}/dashboard/stats`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }

    return data.stats;
  }

  // ===== SUPERADMIN ONLY METHODS =====

  async getUsers(params?: { page?: number; limit?: number; role?: string; status?: string; search?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    console.log('🔍 Fetching users with params:', params);
    console.log('🔑 Auth headers:', this.getAuthHeaders());
    
    const response = await fetch(`${this.baseUrl}/users?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    
    console.log('📡 Users response status:', response.status);
    const data = await response.json();
    console.log('📄 Users response data:', data);
    
    if (!data.success) {
      console.error('❌ Users API Error:', data.message);
      throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
  }

  async updateUser(userId: string, updates: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update user');
    }

    return data;
  }

  async deleteUser(userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete user');
    }

    return data;
  }

  async getSystemAnalytics(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/analytics/system`, {
      headers: this.getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch system analytics');
    }

    return data.analytics;
  }

  async getAllEmployers(status?: 'pending' | 'verified' | 'rejected'): Promise<PendingEmployer[]> {
    console.log('🔍 Fetching all employers with status filter:', status);
    console.log('🔑 Auth headers:', this.getAuthHeaders());
    
    const url = status 
      ? `${this.baseUrl}/employers?status=${status}`
      : `${this.baseUrl}/employers`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);
    
    if (!data.success) {
      console.error('❌ API Error:', data.message || data.error);
      throw new Error(data.message || data.error || 'Failed to fetch employers');
    }

    console.log('✅ Found employers:', data.employers?.length || 0);
    return data.employers || [];
  }

  async getPendingEmployers(): Promise<PendingEmployer[]> {
    console.log('🔍 Fetching pending employers...');
    console.log('🔑 Auth headers:', this.getAuthHeaders());
    const response = await fetch(`${this.baseUrl}/employers/pending`, {
      headers: this.getAuthHeaders()
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);
    
    if (!data.success) {
      console.error('❌ API Error:', data.message || data.error);
      throw new Error(data.message || data.error || 'Failed to fetch pending employers');
    }

    console.log('✅ Found employers:', data.employers?.length || 0);
    return data.employers;
  }

  async getPendingDocuments(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/documents/pending`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch pending documents');
    }

    return data.documents;
  }

  async getEmployerDocuments(employerId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/employers/${employerId}/documents`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch employer documents');
    }

    return data.documents;
  }

  async verifyDocument(documentId: string, action: 'approve' | 'reject', rejectionReason?: string, adminNotes?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/verify`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        action,
        rejectionReason,
        adminNotes
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to verify document');
    }
  }

  async verifyEmployer(employerId: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    console.log('🔄 Verifying employer:', { employerId, action, reason });
    console.log('🔑 Auth headers:', this.getAuthHeaders());
    
    const response = await fetch(`${this.baseUrl}/employers/${employerId}/verify`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action, reason }),
    });

    console.log('📡 Verify employer response status:', response.status);
    const data = await response.json();
    console.log('📄 Verify employer response data:', data);
    
    if (!data.success) {
      console.error('❌ Employer verification failed:', data.message);
      throw new Error(data.message || 'Failed to update employer status');
    }
    
    console.log('✅ Employer verification successful');
  }

  async getJobs(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.baseUrl}/jobs?${queryParams}`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch jobs');
    }

    return data;
  }

  async updateJobStatus(jobId: string, status: string, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update job status');
    }
  }


  async bulkVerifyDocuments(employerId: string, documentIds: string[], action: 'approve' | 'reject', reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/employers/${employerId}/documents/bulk-verify`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentIds, action, reason }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to bulk update document status');
    }

    return data;
  }

  async getAnalytics(period: string = '30') {
    const response = await fetch(`${this.baseUrl}/analytics/users?period=${period}`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch analytics');
    }

    return data.analytics;
  }

  // Super Admin only methods
  async getAdminUsers(): Promise<AdminUser[]> {
    const response = await fetch(`${this.baseUrl}/users?role=admin`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch admin users');
    }

    return data.users;
  }

  async createAdmin(adminData: {
    email: string;
    adminName: string;
    department: string;
    role: 'admin' | 'superadmin';
    password: string;
  }): Promise<AdminUser> {
    console.log('🔄 Creating admin with data:', adminData);
    
    const response = await fetch(`${this.baseUrl}/admins`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        email: adminData.email,
        adminName: adminData.adminName,
        department: adminData.department,
        adminLevel: adminData.role,
        password: adminData.password
      }),
    });

    console.log('📡 Create admin response status:', response.status);
    const data = await response.json();
    console.log('📄 Create admin response data:', data);
    
    if (!data.success) {
      console.error('❌ Admin creation failed:', data.message);
      throw new Error(data.message || 'Failed to create admin user');
    }

    console.log('✅ Admin created successfully');
    return data.admin;
  }

  // Authentication helpers
  isAuthenticated(): boolean {
    return !!(localStorage.getItem('adminUser') && localStorage.getItem('adminToken'));
  }

  getCurrentAdmin(): AdminUser | null {
    const adminData = localStorage.getItem('adminUser');
    return adminData ? JSON.parse(adminData) : null;
  }

  logout(): void {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  }
}

export default new AdminService();
