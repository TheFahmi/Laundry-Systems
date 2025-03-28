// Persistent user data storage
import * as fs from 'fs';
import * as path from 'path';

// Define user interface
export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define the path to our JSON file
const userFilePath = path.join(process.cwd(), 'user-data.json');

// Initial mock users
const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    email: 'staff@example.com',
    name: 'Staff User',
    role: 'staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add the fahmi user as requested
  {
    id: '3',
    username: 'fahmi',
    password: 'gatauu',
    email: 'fahmi@example.com',
    name: 'Fahmi User',
    role: 'staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Load users from file or use initial data
function loadUsers(): User[] {
  try {
    if (fs.existsSync(userFilePath)) {
      const data = fs.readFileSync(userFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users from file:', error);
  }
  // If file doesn't exist or error occurs, use initial data
  saveUsers(initialUsers);
  return initialUsers;
}

// Save users to file
function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving users to file:', error);
  }
}

// Export functions to get and update users
export const userService = {
  getUsers: (): User[] => loadUsers(),
  addUser: (user: User): User => {
    const users = loadUsers();
    users.push(user);
    saveUsers(users);
    return user;
  },
  findUser: (username: string, password: string): User | undefined => {
    const users = loadUsers();
    return users.find(u => u.username === username && u.password === password);
  },
  userExists: (username: string, email: string): User | undefined => {
    const users = loadUsers();
    return users.find(u => u.username === username || u.email === email);
  },
  getUserCount: (): number => {
    return loadUsers().length;
  }
};

// For backward compatibility
export const mockUsers = loadUsers(); 