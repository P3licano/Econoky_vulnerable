/**
 * VULNERABILITY LAB: Seed data for NoSQL Injection demonstration
 * 
 * This file contains test data for the users_backup collection.
 * The data includes sensitive information that should only be
 * accessible through NoSQL injection exploitation.
 * 
 * WARNING: This is for EDUCATIONAL/PENTESTING LAB purposes only.
 * DO NOT use in production environments.
 */

export interface BackupUser {
  email: string;
  name: string;
  userType: 'basic' | 'premium' | 'admin';
  accountStatus: 'active' | 'inactive' | 'vip' | 'premium' | 'suspended';
  address: string;
  creditCard: string;
  flag?: string;
  salary?: number;
  ssn?: string;
  creditLimit?: number;
  notes?: string;
}

/**
 * PENTESTING LAB: Backup users data
 * 
 * This data simulates a backup database that contains sensitive
 * user information. The vulnerability allows extraction of this
 * data via NoSQL injection.
 * 
 * Data structure:
 * - Basic users: Masked credit cards, limited info
 * - Premium users: Partial credit card visibility
 * - Admin users: Full sensitive data + FLAG
 */
export const backupUsersData: BackupUser[] = [
  // Basic users - should be visible by default
  {
    email: "user1@econoky.com",
    name: "John Doe",
    userType: "basic",
    accountStatus: "active",
    address: "123 Main St, Springfield, USA",
    creditCard: "XXXX-XXXX-XXXX-1234"
  },
  {
    email: "user2@econoky.com",
    name: "Jane Smith",
    userType: "basic",
    accountStatus: "active",
    address: "456 Oak Ave, Portland, USA",
    creditCard: "XXXX-XXXX-XXXX-5678"
  },
  {
    email: "user3@econoky.com",
    name: "Robert Johnson",
    userType: "basic",
    accountStatus: "inactive",
    address: "789 Pine Rd, Seattle, USA",
    creditCard: "XXXX-XXXX-XXXX-9012"
  },
  {
    email: "maria.garcia@econoky.com",
    name: "Maria Garcia",
    userType: "basic",
    accountStatus: "active",
    address: "321 Elm St, Denver, USA",
    creditCard: "XXXX-XXXX-XXXX-3456"
  },
  
  // Premium users - sensitive data visible via injection
  {
    email: "vip@econoky.com",
    name: "VIP Customer",
    userType: "premium",
    accountStatus: "vip",
    address: "777 Luxury Ave, Elite District, Beverly Hills, CA 90210",
    creditCard: "5500-9876-5432-1111",
    creditLimit: 50000,
    notes: "High-value customer, priority support enabled"
  },
  {
    email: "gold.member@econoky.com",
    name: "Gold Member",
    userType: "premium",
    accountStatus: "premium",
    address: "555 Premium Blvd, Exclusive Heights, Miami, FL 33101",
    creditCard: "4111-2222-3333-4444",
    creditLimit: 25000,
    notes: "VIP tier 2, express checkout enabled"
  },
  
  // Admin user - contains the FLAG
  {
    email: "admin@econoky.com",
    name: "Administrator",
    userType: "admin",
    accountStatus: "premium",
    address: "999 Admin Tower, Secure City, ADMIN-ZONE 00001",
    creditCard: "4532-1234-5678-9999",
    flag: "ECONOKY{n0sql_1nj3ct10n_pwn3d_th3_b4ckup}",
    salary: 150000,
    ssn: "123-45-6789",
    notes: "System administrator - full access granted"
  }
];

export default backupUsersData;
