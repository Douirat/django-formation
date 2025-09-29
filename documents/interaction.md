# Django Authentication: Request-Response Model & Client-Server Interaction Guide

## Table of Contents
1. [How Authentication Affects Request-Response Model](#1-how-authentication-affects-request-response-model)
2. [Django's Request-Response Lifecycle with Authentication](#2-djangos-request-response-lifecycle-with-authentication)
3. [Token-Based Authentication Deep Dive](#3-token-based-authentication-deep-dive)
4. [Client-Server Authentication Interaction](#4-client-server-authentication-interaction)
5. [Complete Client Implementation Examples](#5-complete-client-implementation-examples)
6. [Authentication Middleware and Security](#6-authentication-middleware-and-security)
7. [Error Handling and Edge Cases](#7-error-handling-and-edge-cases)
8. [Best Practices for Client Applications](#8-best-practices-for-client-applications)

---

## 1. How Authentication Affects Request-Response Model

### Standard Web Request-Response (Without Authentication)
```
Client Request → Server Processing → Response
    ↓                    ↓              ↓
[HTTP Request]    [View Function]   [HTTP Response]
```

### Authenticated Request-Response (With Token Authentication)
```
Client Request → Authentication Layer → Authorization → Server Processing → Response
    ↓                    ↓                   ↓              ↓              ↓
[HTTP Request    → [Token Validation] → [Permission    → [View         → [HTTP Response
 + Token]              ↓                  Check]          Function]       + User Context]
              [request.user populated]        ↓
                                    [Access Granted/Denied]
```

### Key Changes with Authentication:

1. **Request Enhancement**: Client must include authentication credentials
2. **Middleware Processing**: Django validates tokens before reaching views
3. **User Context**: `request.user` gets populated with authenticated user
4. **Permission Checks**: Views can enforce authorization rules
5. **Response Context**: Server knows who made the request

---

## 2. Django's Request-Response Lifecycle with Authentication

### Complete Flow Diagram:
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───→│  Django Server   │───→│   Database      │
│                 │    │                  │    │                 │
│ 1. Send Request │    │ 2. Middleware    │    │ 5. Query Data   │
│    + Token      │    │    Processing    │    │                 │
└─────────────────┘    │                  │    └─────────────────┘
         ↑              │ 3. Auth Token    │              │
         │              │    Validation    │              │
         │              │                  │              ▼
┌─────────────────┐    │ 4. View Function │    ┌─────────────────┐
│ 7. Process      │◄───│    Execution     │◄───│ 6. Return Data  │
│    Response     │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Step-by-Step Breakdown:

#### Step 1: Client Sends Authenticated Request
```http
POST /api/customers/profile/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
Content-Type: application/json

{
    "first_name": "John",
    "last_name": "Doe"
}
```

#### Step 2: Django Middleware Processing
```python
# Django's middleware stack processes the request
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # ← This handles auth
    'django.contrib.messages.middleware.MessageMiddleware',
    'rest_framework.middleware.CsrfViewMiddleware',  # DRF middleware
]
```

#### Step 3: Token Authentication Process
```python
# DRF's TokenAuthentication class processes the token
class TokenAuthentication:
    def authenticate(self, request):
        # 1. Extract token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Token '):
            return None
        
        # 2. Parse the token
        token = auth_header.split(' ')[1]
        
        # 3. Query database for token
        try:
            token_obj = Token.objects.get(key=token)
            user = token_obj.user
        except Token.DoesNotExist:
            return None
        
        # 4. Return user and token
        return (user, token_obj)
```

#### Step 4: Request Object Enhancement
After successful authentication, Django enhances the request object:
```python
# Before authentication
request.user = AnonymousUser()
request.auth = None

# After successful authentication
request.user = Customer(id=1, username='johndoe', email='john@example.com')
request.auth = Token(key='9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b', user_id=1)
```

#### Step 5: View Function Execution
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # This decorator checks request.user
def update_profile(request):
    # At this point, request.user is the authenticated Customer object
    user = request.user  # Customer instance, not AnonymousUser
    
    # You can access user properties
    print(f"Authenticated user: {user.username}")
    print(f"User email: {user.email}")
    
    # Process the request with user context
    serializer = CustomerSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=400)
```

#### Step 6: Response Generation
```python
# Django generates response with user context
response_data = {
    'id': user.id,
    'username': user.username,
    'email': user.email,
    'first_name': 'John',
    'last_name': 'Doe'
}

# HTTP Response sent back to client
return Response(response_data, status=200)
```

---

## 3. Token-Based Authentication Deep Dive

### Token Structure and Storage

#### Database Schema:
```sql
-- Token table structure
CREATE TABLE authtoken_token (
    key VARCHAR(40) PRIMARY KEY,           -- The actual token string
    user_id INTEGER UNIQUE,                -- Links to customer
    created TIMESTAMP DEFAULT NOW(),       -- When token was created
    FOREIGN KEY (user_id) REFERENCES customers_customer(id)
);

-- Example token record
INSERT INTO authtoken_token VALUES (
    '9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b',  -- 40-char random string
    1,                                            -- User ID
    '2024-01-15 10:30:00'                        -- Creation timestamp
);
```

#### Token Generation Process:
```python
import binascii
import os

def generate_token():
    """How Django generates tokens"""
    return binascii.hexlify(os.urandom(20)).decode()
    # Produces: '9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b'
```

### Authentication Header Formats

#### Correct Format:
```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

#### Common Mistakes:
```http
# Wrong - missing 'Token' prefix
Authorization: 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

# Wrong - using 'Bearer' (that's for JWT)
Authorization: Bearer 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

# Wrong - case sensitive
Authorization: token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Token Validation Process:
```python
def validate_token_step_by_step(auth_header):
    """Step by step token validation"""
    
    # Step 1: Check header exists
    if not auth_header:
        return None, "No Authorization header"
    
    # Step 2: Check format
    if not auth_header.startswith('Token '):
        return None, "Invalid authorization format"
    
    # Step 3: Extract token
    try:
        token_string = auth_header.split(' ')[1]
    except IndexError:
        return None, "Malformed authorization header"
    
    # Step 4: Validate token length
    if len(token_string) != 40:
        return None, "Invalid token length"
    
    # Step 5: Database lookup
    try:
        token_obj = Token.objects.select_related('user').get(key=token_string)
    except Token.DoesNotExist:
        return None, "Invalid token"
    
    # Step 6: Check user is active
    if not token_obj.user.is_active:
        return None, "User account is disabled"
    
    return token_obj.user, "Success"
```

---

## 4. Client-Server Authentication Interaction

### Complete Authentication Workflow

#### Phase 1: Registration/Login (Get Token)
```
Client                           Server                          Database
  │                               │                               │
  │ POST /register/               │                               │
  │ {username, email, password}   │                               │
  ├──────────────────────────────→│                               │
  │                               │ Validate data                 │
  │                               │ Hash password                 │
  │                               │ Create user ─────────────────→│
  │                               │                               │ INSERT user
  │                               │ Generate token ──────────────→│ INSERT token
  │                               │                               │
  │ Response: {token, user_data}  │←──────────────────────────────│
  │←──────────────────────────────│                               │
  │                               │                               │
  │ Store token locally           │                               │
  │                               │                               │
```

#### Phase 2: Authenticated Requests
```
Client                           Server                          Database
  │                               │                               │
  │ POST /api/profile/            │                               │
  │ Authorization: Token abc123   │                               │
  ├──────────────────────────────→│                               │
  │                               │ Extract token                 │
  │                               │ Validate token ──────────────→│
  │                               │                               │ SELECT token, user
  │                               │←──────────────────────────────│ 
  │                               │ request.user = User object    │
  │                               │ Execute view function         │
  │                               │ Query user data ─────────────→│
  │                               │                               │ SELECT user profile
  │ Response: {profile_data}      │←──────────────────────────────│
  │←──────────────────────────────│                               │
  │                               │                               │
```

#### Phase 3: Logout (Destroy Token)
```
Client                           Server                          Database
  │                               │                               │
  │ POST /logout/                 │                               │
  │ Authorization: Token abc123   │                               │
  ├──────────────────────────────→│                               │
  │                               │ Validate token                │
  │                               │ Identify user                 │
  │                               │ Delete token ────────────────→│
  │                               │                               │ DELETE FROM tokens
  │ Response: {success: true}     │                               │
  │←──────────────────────────────│                               │
  │                               │                               │
  │ Remove token from storage     │                               │
  │                               │                               │
```

---

## 5. Complete Client Implementation Examples

### JavaScript/Web Client

#### HTML Setup:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Customer Portal</title>
</head>
<body>
    <div id="auth-section">
        <h2>Login</h2>
        <form id="login-form">
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
    
    <div id="profile-section" style="display: none;">
        <h2>Profile</h2>
        <div id="profile-data"></div>
        <button id="logout-btn">Logout</button>
    </div>
    
    <script src="client.js"></script>
</body>
</html>
```

#### JavaScript Client Implementation:
```javascript
class CustomerAPIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('authToken');
        this.setupEventListeners();
    }
    
    // Helper method for authenticated requests
    async makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add authentication token if available
        if (this.token) {
            headers['Authorization'] = `Token ${this.token}`;
        }
        
        const response = await fetch(`${this.baseURL}${url}`, {
            ...options,
            headers
        });
        
        // Handle authentication errors
        if (response.status === 401) {
            this.handleAuthError();
            throw new Error('Authentication failed');
        }
        
        return response;
    }
    
    // Registration
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (response.ok) {
                const data = await response.json();
                this.setToken(data.token);
                return data;
            } else {
                const errors = await response.json();
                throw new Error(JSON.stringify(errors));
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }
    
    // Login
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.setToken(data.token);
                this.showProfileSection(data.customer);
                return data;
            } else {
                const error = await response.json();
                alert(error.error || 'Login failed');
                throw new Error(error.error);
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }
    
    // Get profile (requires authentication)
    async getProfile() {
        try {
            const response = await this.makeAuthenticatedRequest('/profile/', {
                method: 'GET'
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Profile fetch failed:', error);
            throw error;
        }
    }
    
    // Update profile (requires authentication)
    async updateProfile(profileData) {
        try {
            const response = await this.makeAuthenticatedRequest('/profile/', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                const errors = await response.json();
                throw new Error(JSON.stringify(errors));
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    }
    
    // Logout
    async logout() {
        try {
            if (this.token) {
                await this.makeAuthenticatedRequest('/logout/', {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
            // Continue with local logout even if server request fails
        } finally {
            this.clearToken();
            this.showAuthSection();
        }
    }
    
    // Token management
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }
    
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
    
    // Authentication error handling
    handleAuthError() {
        console.log('Authentication error - redirecting to login');
        this.clearToken();
        this.showAuthSection();
    }
    
    // UI Management
    showAuthSection() {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('profile-section').style.display = 'none';
    }
    
    showProfileSection(customerData) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('profile-section').style.display = 'block';
        document.getElementById('profile-data').innerHTML = `
            <p>Welcome, ${customerData.username}!</p>
            <p>Email: ${customerData.email}</p>
            <p>Birth Date: ${customerData.birth_date || 'Not set'}</p>
        `;
    }
    
    // Event listeners
    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                await this.login(username, password);
            } catch (error) {
                console.error('Login error:', error);
            }
        });
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
        
        // Check if already logged in on page load
        if (this.token) {
            this.getProfile().then(data => {
                this.showProfileSection(data);
            }).catch(() => {
                this.handleAuthError();
            });
        }
    }
}

// Initialize the client
const client = new CustomerAPIClient('http://localhost:8000/api');
```

### Python Client Example

```python
import requests
import json
from typing import Optional, Dict, Any

class CustomerAPIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.token: Optional[str] = None
        self.session = requests.Session()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers with authentication if token is available"""
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Token {self.token}'
        return headers
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        
        # Merge custom headers if provided
        if 'headers' in kwargs:
            headers.update(kwargs['headers'])
        
        response = self.session.request(
            method=method,
            url=url,
            headers=headers,
            **kwargs
        )
        
        # Handle authentication errors
        if response.status_code == 401:
            self.token = None
            raise Exception("Authentication failed - token may be invalid")
        
        return response
    
    def register(self, username: str, email: str, password: str, 
                birth_date: Optional[str] = None) -> Dict[str, Any]:
        """Register a new customer"""
        data = {
            'username': username,
            'email': email,
            'password': password
        }
        if birth_date:
            data['birth_date'] = birth_date
        
        response = self._make_request('POST', '/register/', json=data)
        
        if response.status_code == 201:
            result = response.json()
            self.token = result['token']
            print(f"Registration successful! Token: {self.token}")
            return result
        else:
            errors = response.json()
            raise Exception(f"Registration failed: {errors}")
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """Login and get authentication token"""
        data = {
            'username': username,
            'password': password
        }
        
        response = self._make_request('POST', '/login/', json=data)
        
        if response.status_code == 200:
            result = response.json()
            self.token = result['token']
            print(f"Login successful! Token: {self.token}")
            return result
        else:
            error = response.json()
            raise Exception(f"Login failed: {error.get('error', 'Unknown error')}")
    
    def get_profile(self) -> Dict[str, Any]:
        """Get customer profile (requires authentication)"""
        if not self.token:
            raise Exception("Must be logged in to access profile")
        
        response = self._make_request('GET', '/profile/')
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get profile: {response.status_code}")
    
    def update_profile(self, **profile_data) -> Dict[str, Any]:
        """Update customer profile (requires authentication)"""
        if not self.token:
            raise Exception("Must be logged in to update profile")
        
        response = self._make_request('PUT', '/profile/', json=profile_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            errors = response.json()
            raise Exception(f"Profile update failed: {errors}")
    
    def logout(self) -> bool:
        """Logout and invalidate token"""
        if not self.token:
            print("Not logged in")
            return True
        
        try:
            response = self._make_request('POST', '/logout/')
            if response.status_code == 200:
                print("Logout successful")
                return True
            else:
                print(f"Logout request failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"Logout error: {e}")
            return False
        finally:
            # Clear token regardless of server response
            self.token = None
    
    def is_authenticated(self) -> bool:
        """Check if client has a token"""
        return self.token is not None

# Example usage
def main():
    client = CustomerAPIClient('http://localhost:8000/api')
    
    try:
        # Register or login
        choice = input("1. Register\n2. Login\nChoose (1/2): ")
        
        if choice == '1':
            username = input("Username: ")
            email = input("Email: ")
            password = input("Password: ")
            birth_date = input("Birth Date (YYYY-MM-DD, optional): ") or None
            
            result = client.register(username, email, password, birth_date)
            print(f"Welcome {result['customer']['username']}!")
            
        elif choice == '2':
            username = input("Username: ")
            password = input("Password: ")
            
            result = client.login(username, password)
            print(f"Welcome back {result['customer']['username']}!")
        
        # Now make authenticated requests
        if client.is_authenticated():
            profile = client.get_profile()
            print(f"Profile: {json.dumps(profile, indent=2)}")
            
            # Update profile example
            update_choice = input("Update profile? (y/n): ")
            if update_choice.lower() == 'y':
                first_name = input("First Name: ")
                last_name = input("Last Name: ")
                
                updated_profile = client.update_profile(
                    first_name=first_name,
                    last_name=last_name
                )
                print(f"Updated Profile: {json.dumps(updated_profile, indent=2)}")
        
        # Logout
        logout_choice = input("Logout? (y/n): ")
        if logout_choice.lower() == 'y':
            client.logout()
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
```

### React Client Example

```jsx
import React, { useState, useEffect, createContext, useContext } from 'react';

// Authentication Context
const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const API_BASE = 'http://localhost:8000/api';
    
    // Helper function for API calls
    const apiCall = async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token is invalid, clear it
            logout();
            throw new Error('Authentication failed');
        }
        
        return response;
    };
    
    // Login function
    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await apiCall('/login/', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                setUser(data.customer);
                localStorage.setItem('authToken', data.token);
                return data;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Register function
    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await apiCall('/register/', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                setUser(data.customer);
                localStorage.setItem('authToken', data.token);
                return data;
            } else {
                const errors = await response.json();
                throw new Error(Object.values(errors).flat().join(', '));
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Logout function
    const logout = async () => {
        if (token) {
            try {
                await apiCall('/logout/', { method: 'POST' });
            } catch (error) {
                console.error('Logout request failed:', error);
            }
        }
        
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
    };
    
    // Get profile
    const getProfile = async () => {
        if (!token) return null;
        
        try {
            const response = await apiCall('/profile/');
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
        return null;
    };
    
    // Update profile
    const updateProfile = async (profileData) => {
        const response = await apiCall('/profile/', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            const updatedUser = await response.json();
            setUser(updatedUser);
            return updatedUser;
        } else {
            const errors = await response.json();
            throw new Error(Object.values(errors).flat().join(', '));
        }
    };
    
    // Check authentication on component mount
    useEffect(() => {
        if (token && !user) {
            getProfile();
        }
    }, [token, user]);
    
    const value = {
        token,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        apiCall,
        isAuthenticated: !!token
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Login Component
const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await login(username, password);
        } catch (error) {
            setError(error.message);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <div style={{color: 'red'}}>{error}</div>}
            
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

// Profile Component
const Profile = () => {
    const { user, logout, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || ''
    });
    
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            setEditing(false);
        } catch (error) {
            alert(error.message);
        }
    };
    
    if (!user) return <div>Loading...</div>;
    
    return (
        <div>
            <h2>Profile</h2>
            
            {!editing ? (
                <div>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>First Name:</strong> {user.first_name || 'Not set'}</p>
                    <p><strong>Last Name:</strong> {user.last_name || 'Not set'}</p>
                    <p><strong>Birth Date:</strong> {user.birth_date || 'Not set'}</p>
                    
                    <button onClick={() => setEditing(true)}>Edit Profile</button>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <form onSubmit={handleUpdate}>
                    <div>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        />
                    </div>
                    
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
};

// Main App Component
const App = () => {
    const { isAuthenticated } = useAuth();
    
    return (
        <div style={{padding: '20px'}}>
            <h1>Customer Portal</h1>
            {isAuthenticated ? <Profile /> : <LoginForm />}
        </div>
    );
};

// Root component with provider
const AppWithAuth = () => {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
};

export default AppWithAuth;
```

---

## 6. Authentication Middleware and Security

### Django's Authentication Middleware Stack

#### How Middleware Processes Requests:
```python
# settings.py - Middleware order is crucial
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',        # Security headers
    'django.contrib.sessions.middleware.SessionMiddleware', # Session handling
    'django.middleware.common.CommonMiddleware',            # Common functionality
    'django.middleware.csrf.CsrfViewMiddleware',           # CSRF protection
    'django.contrib.auth.middleware.AuthenticationMiddleware', # ← Authentication happens here
    'django.contrib.messages.middleware.MessageMiddleware', # Flash messages
    'django.middleware.clickjacking.XFrameOptionsMiddleware', # Clickjacking protection
]
```

#### Authentication Middleware Process:
```python
class AuthenticationMiddleware:
    """Simplified version of Django's AuthenticationMiddleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # This runs BEFORE the view
        request.user = self.get_user(request)
        
        # Call the view
        response = self.get_response(request)
        
        # This runs AFTER the view (if needed)
        return response
    
    def get_user(self, request):
        """Determine the user for this request"""
        # Try each authentication backend
        for backend in get_backends():
            try:
                user = backend.authenticate(request)
                if user:
                    return user
            except Exception:
                continue
        
        # No authentication successful
        return AnonymousUser()
```

#### DRF Authentication Classes:
```python
# How DRF's TokenAuthentication works
class TokenAuthentication(BaseAuthentication):
    keyword = 'Token'
    model = Token
    
    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        
        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None
        
        if len(auth) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(auth) > 2:
            raise AuthenticationFailed('Invalid token header. Token string should not contain spaces.')
        
        try:
            token = auth[1].decode()
        except UnicodeError:
            raise AuthenticationFailed('Invalid token header. Token string should not contain invalid characters.')
        
        return self.authenticate_credentials(token)
    
    def authenticate_credentials(self, key):
        model = self.get_model()
        try:
            token = model.objects.select_related('user').get(key=key)
        except model.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')
        
        if not token.user.is_active:
            raise AuthenticationFailed('User inactive or deleted.')
        
        return (token.user, token)
```

### Security Considerations

#### Token Security Best Practices:
```python
# Example of enhanced token security
class SecureTokenAuthentication(TokenAuthentication):
    """Enhanced token authentication with additional security"""
    
    def authenticate_credentials(self, key):
        # Basic token validation
        user, token = super().authenticate_credentials(key)
        
        # Additional security checks
        
        # 1. Check token age (implement token expiration)
        if self.is_token_expired(token):
            raise AuthenticationFailed('Token has expired.')
        
        # 2. Check for suspicious activity
        if self.detect_suspicious_activity(token, self.request):
            raise AuthenticationFailed('Suspicious activity detected.')
        
        # 3. Update last used timestamp
        self.update_token_usage(token)
        
        return (user, token)
    
    def is_token_expired(self, token):
        """Check if token is older than allowed age"""
        from datetime import datetime, timedelta
        token_age = datetime.now() - token.created
        max_age = timedelta(days=30)  # Token expires after 30 days
        return token_age > max_age
    
    def detect_suspicious_activity(self, token, request):
        """Detect suspicious activity patterns"""
        # Check for too many requests from different IPs
        # Check for unusual usage patterns
        # Implement rate limiting per token
        return False  # Simplified
    
    def update_token_usage(self, token):
        """Update token usage statistics"""
        # Update last_used timestamp
        # Log usage for analysis
        pass
```

#### HTTPS and Security Headers:
```python
# settings.py - Security settings for production
SECURE_SSL_REDIRECT = True                    # Force HTTPS
SECURE_HSTS_SECONDS = 31536000               # HTTP Strict Transport Security
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True           # Prevent MIME type sniffing
SECURE_BROWSER_XSS_FILTER = True             # Enable XSS filtering
X_FRAME_OPTIONS = 'DENY'                     # Prevent clickjacking

# CORS settings for API
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
CORS_ALLOW_CREDENTIALS = True                 # Allow cookies/auth headers
```

---

## 7. Error Handling and Edge Cases

### Common Authentication Errors

#### Client-Side Error Handling:
```javascript
class AuthError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
        this.details = details;
    }
}

class APIClient {
    async makeRequest(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, options);
            
            // Handle different error scenarios
            switch (response.status) {
                case 401:
                    // Token expired or invalid
                    this.handleTokenExpired();
                    throw new AuthError('Authentication required', 401);
                
                case 403:
                    // User doesn't have permission
                    throw new AuthError('Access forbidden', 403);
                
                case 429:
                    // Rate limited
                    throw new AuthError('Too many requests', 429);
                
                case 500:
                    // Server error
                    throw new AuthError('Server error', 500);
                
                default:
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new AuthError('Request failed', response.status, errorData);
                    }
            }
            
            return response;
            
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            
            // Network or other errors
            throw new AuthError('Network error', 0, error.message);
        }
    }
    
    handleTokenExpired() {
        // Clear stored token
        localStorage.removeItem('authToken');
        
        // Redirect to login or show login modal
        window.location.href = '/login';
        
        // Or trigger a global auth state update
        this.dispatchEvent(new CustomEvent('auth:expired'));
    }
}
```

#### Server-Side Error Handling:
```python
# views.py - Enhanced error handling
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Custom exception handler with detailed logging"""
    
    # Get the standard error response
    response = exception_handler(exc, context)
    
    if response is not None:
        # Log the error with context
        logger.error(f"API Error: {exc}", extra={
            'user': context['request'].user,
            'path': context['request'].path,
            'method': context['request'].method,
            'status_code': response.status_code
        })
        
        # Customize error response format
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': response.data,
            'status_code': response.status_code
        }
        
        # Don't expose internal errors in production
        if not settings.DEBUG and response.status_code == 500:
            custom_response_data['details'] = 'Internal server error'
        
        response.data = custom_response_data
    
    return response

# Enhanced view with comprehensive error handling
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user = request.user
        serializer = CustomerSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Log successful update
            logger.info(f"Profile updated for user {user.username}")
            
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            })
        else:
            # Log validation errors
            logger.warning(f"Profile update validation failed for user {user.username}: {serializer.errors}")
            
            return Response({
                'error': True,
                'message': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error in update_profile for user {request.user}: {str(e)}")
        
        return Response({
            'error': True,
            'message': 'An unexpected error occurred',
            'details': str(e) if settings.DEBUG else 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### Edge Cases and Solutions

#### Token Expiration Handling:
```javascript
class TokenManager {
    constructor() {
        this.refreshPromise = null;
    }
    
    async refreshToken() {
        // Prevent multiple simultaneous refresh attempts
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        
        this.refreshPromise = this._performRefresh();
        
        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.refreshPromise = null;
        }
    }
    
    async _performRefresh() {
        // Implementation depends on your token refresh strategy
        // This could involve refresh tokens, re-authentication, etc.
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        const response = await fetch('/api/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.access);
            return data.access;
        }
        
        throw new Error('Token refresh failed');
    }
}
```

#### Concurrent Request Handling:
```javascript
class RequestQueue {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.isRefreshing = false;
        this.failedQueue = [];
    }
    
    async processRequest(config) {
        if (this.isRefreshing) {
            // Queue the request while token is being refreshed
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject, config });
            });
        }
        
        try {
            return await this.apiClient.makeRequest(config);
        } catch (error) {
            if (error.status === 401 && !config._retry) {
                return this.handleTokenRefresh(config);
            }
            throw error;
        }
    }
    
    async handleTokenRefresh(originalConfig) {
        if (this.isRefreshing) {
            // Already refreshing, queue this request
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject, config: originalConfig });
            });
        }
        
        this.isRefreshing = true;
        
        try {
            await this.apiClient.refreshToken();
            
            // Process queued requests
            this.processQueue(null);
            
            // Retry original request
            originalConfig._retry = true;
            return await this.apiClient.makeRequest(originalConfig);
            
        } catch (error) {
            this.processQueue(error);
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }
    
    processQueue(error) {
        this.failedQueue.forEach(({ resolve, reject, config }) => {
            if (error) {
                reject(error);
            } else {
                resolve(this.apiClient.makeRequest(config));
            }
        });
        
        this.failedQueue = [];
    }
}
```

---

## 8. Best Practices for Client Applications

### Security Best Practices

#### 1. Secure Token Storage:
```javascript
// ❌ Bad - Vulnerable to XSS
localStorage.setItem('token', 'abc123');

// ✅ Good - More secure approaches
class SecureStorage {
    // Option 1: HttpOnly cookies (set by server)
    static setTokenCookie(token) {
        // Server sets: Set-Cookie: authToken=abc123; HttpOnly; Secure; SameSite=Strict
        // Client cannot access via JavaScript (XSS protection)
    }
    
    // Option 2: Secure localStorage with additional checks
    static setToken(token) {
        // Check for HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            throw new Error('Tokens can only be stored over HTTPS');
        }
        
        // Add timestamp for expiration
        const tokenData = {
            token: token,
            timestamp: Date.now(),
            expiresIn: 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        
        localStorage.setItem('authToken', JSON.stringify(tokenData));
    }
    
    static getToken() {
        const tokenData = JSON.parse(localStorage.getItem('authToken') || '{}');
        
        // Check expiration
        if (tokenData.timestamp && tokenData.expiresIn) {
            if (Date.now() - tokenData.timestamp > tokenData.expiresIn) {
                this.clearToken();
                return null;
            }
        }
        
        return tokenData.token;
    }
    
    static clearToken() {
        localStorage.removeItem('authToken');
    }
}
```

#### 2. Request Validation and Sanitization:
```javascript
class APIValidator {
    static sanitizeInput(data) {
        const sanitized = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Basic XSS prevention
                sanitized[key] = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .trim();
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }
    
    static validateUserData(userData) {
        const errors = {};
        
        // Username validation
        if (!userData.username || userData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userData.email || !emailRegex.test(userData.email)) {
            errors.email = 'Valid email is required';
        }
        
        // Password validation
        if (!userData.password || userData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}
```

#### 3. State Management and Persistence:
```javascript
// Redux-style auth state management
class AuthStateManager {
    constructor() {
        this.state = {
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false
        };
        this.listeners = [];
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
    
    // Actions
    async login(username, password) {
        this.setState({ isLoading: true, error: null });
        
        try {
            const response = await apiClient.login(username, password);
            this.setState({
                user: response.customer,
                token: response.token,
                isAuthenticated: true,
                isLoading: false
            });
            
            // Persist to storage
            SecureStorage.setToken(response.token);
            
        } catch (error) {
            this.setState({
                error: error.message,
                isLoading: false,
                isAuthenticated: false
            });
            throw error;
        }
    }
    
    logout() {
        this.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
        });
        
        SecureStorage.clearToken();
        
        // Call server logout endpoint
        apiClient.logout().catch(console.error);
    }
    
    // Initialize from stored token
    async initializeAuth() {
        const token = SecureStorage.getToken();
        if (!token) return;
        
        this.setState({ isLoading: true });
        
        try {
            // Validate token with server
            const user = await apiClient.getProfile();
            this.setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            // Token is invalid
            this.logout();
        }
    }
}

// Global auth manager instance
const authManager = new AuthStateManager();

// Initialize auth on app start
authManager.initializeAuth();
```

### Performance Optimization

#### 1. Request Caching and Deduplication:
```javascript
class CachedAPIClient {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
    }
    
    async get(endpoint, options = {}) {
        const cacheKey = `${endpoint}${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey) && !options.skipCache) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
                return cached.data;
            }
        }
        
        // Deduplicate identical requests
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }
        
        // Make request
        const requestPromise = this.makeRequest('GET', endpoint, options)
            .then(data => {
                // Cache successful response
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
                return data;
            })
            .finally(() => {
                // Remove from pending requests
                this.pendingRequests.delete(cacheKey);
            });
        
        this.pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }
    
    invalidateCache(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}
```

#### 2. Lazy Loading and Code Splitting:
```javascript
// Dynamic imports for route-based code splitting
const routes = [
    {
        path: '/profile',
        component: () => import('./components/Profile').then(m => m.default)
    },
    {
        path: '/dashboard',
        component: () => import('./components/Dashboard').then(m => m.default)
    }
];

// Lazy load authentication components
const LazyAuthProvider = React.lazy(() => import('./auth/AuthProvider'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LazyAuthProvider>
                <Router routes={routes} />
            </LazyAuthProvider>
        </Suspense>
    );
}
```

### Monitoring and Analytics

#### 1. Authentication Event Tracking:
```javascript
class AuthAnalytics {
    static track(event, data = {}) {
        // Send to analytics service
        if (window.gtag) {
            window.gtag('event', event, {
                event_category: 'authentication',
                ...data
            });
        }
        
        // Custom analytics
        this.sendCustomEvent(event, data);
    }
    
    static sendCustomEvent(event, data) {
        fetch('/api/analytics/track/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event,
                data,
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                url: window.location.href
            })
        }).catch(console.error);
    }
    
    // Track authentication events
    static trackLogin(method = 'password') {
        this.track('login', { method });
    }
    
    static trackLogout() {
        this.track('logout');
    }
    
    static trackAuthError(error) {
        this.track('auth_error', { error: error.message });
    }
}
```

## Conclusion

Understanding how Django's authentication model affects the request-response cycle is crucial for building secure, efficient client applications. The key points to remember:

1. **Authentication Flow**: Tokens are validated on every request before your view functions execute
2. **Request Enhancement**: Successful authentication populates `request.user` with the authenticated user object  
3. **Client Responsibility**: Clients must securely store and transmit tokens with every authenticated request
4. **Error Handling**: Robust error handling for expired tokens, network issues, and authorization failures is essential
5. **Security First**: Always use HTTPS, validate inputs, and follow security best practices
6. **Performance**: Implement caching, request deduplication, and efficient state management

This authentication model provides a solid foundation for building scalable, secure web applications with clear separation between client and server responsibilities.