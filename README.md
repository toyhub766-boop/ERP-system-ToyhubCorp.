# Toy Hub Corporation — Internal ERP & Inventory Management System

A full-stack internal ERP and business operations management system built for managing inventory, production, customers, sales, dispatch, accounts, attendance, reporting, and related operational workflows.

---

## 1. Overview

The Toy Hub Corporation Internal ERP System is a centralized business management platform designed to replace fragmented operational processes with a single internal application.

The system provides dedicated modules for:

* Authentication and access control
* Inventory management
* Stock IN / OUT
* Inventory logs
* Bill of Materials (BOM)
* Production management
* Production capacity planning
* Customer Relationship Management (CRM)
* Sales pipeline
* Customer orders
* Payments
* Dispatch management
* Accounts and due dates
* Employee and attendance management
* Reports and exports

The application consists of:

* A web-based administrative interface
* A backend REST API
* A MongoDB database
* A mobile-compatible application generated using Capacitor

---

# 2. Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* React Router
* Axios

## Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication

## Database

* MongoDB
* MongoDB Atlas for cloud database hosting

## Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

## Mobile

* Capacitor
* Android Studio
* Android APK

## Development & Testing

* Git / GitHub
* Postman
* npm
* REST APIs

---

# 3. System Architecture

The application follows a standard client-server architecture.

```text
                    ┌─────────────────────┐
                    │      Web Client     │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │     Express API     │
                    │ Node.js + TypeScript │
                    └──────────┬──────────┘
                               │
                               │ Mongoose
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │    Atlas Database   │
                    └─────────────────────┘


                    ┌─────────────────────┐
                    │  Android Application│
                    │      Capacitor      │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                         Express API
```

The frontend does not directly communicate with MongoDB.

All database operations are handled by the backend API.

---

# 4. Repository Structure

The project is divided into frontend and backend applications.

A typical structure is:

```text
project-root/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

The exact directory names may vary depending on the current implementation.

---

# 5. Authentication & Authorization

The system uses JWT-based authentication.

## Authentication Flow

```text
User
  │
  ▼
Login
  │
  ▼
Backend validates credentials
  │
  ▼
JWT generated
  │
  ▼
Token returned to client
  │
  ▼
Client stores authentication state
  │
  ▼
Protected API requests include token
  │
  ▼
Backend verifies token
  │
  ▼
Authorized request processed
```

## Access Control

The application supports role-based access.

Primary operational roles include:

* Founder / Admin
* Inventory
* Production
* Accountant
* Attendance / HR
* CRM

Access to protected modules is controlled based on the authenticated user's role.

---

# 6. Login System

The application provides separate access flows for different types of users.

The login interface supports:

* Staff application access
* Administrative access

After authentication, the user is redirected to the appropriate application area according to their role and permissions.

---

# 7. Inventory Management

The Inventory module manages the organization's products, categories, warehouses, and stock movements.

## Main Features

* Product management
* Category management
* Warehouse management
* Product search
* Product filtering
* Stock IN
* Stock OUT
* Inventory logs
* Stock status
* Raw material management
* Finished product management

---

# 8. Product Management

Products are categorized according to their operational purpose.

The product system supports:

```text
RAW
FINISHED
```

## Product Information

Depending on the product type, product records may contain information such as:

* Product name
* SKU / identifier
* Category
* Product type
* Warehouse
* Quantity
* Unit
* Pricing information
* Stock status
* Other operational metadata

---

# 9. Stock Management

The system records inventory movements through Stock IN and Stock OUT operations.

## Stock IN

Stock IN increases available inventory.

Typical workflow:

```text
Select Product
      ↓
Select Warehouse
      ↓
Enter Quantity
      ↓
Submit Stock IN
      ↓
Inventory Updated
      ↓
Inventory Log Created
```

## Stock OUT

Stock OUT decreases available inventory.

```text
Select Product
      ↓
Select Warehouse
      ↓
Enter Quantity
      ↓
Validate Available Stock
      ↓
Submit Stock OUT
      ↓
Inventory Updated
      ↓
Inventory Log Created
```

Stock movement records provide an operational history of inventory changes.

---

# 10. Inventory Status

Products can have stock health indicators such as:

* Healthy
* Low Stock
* Critical

These indicators allow users to identify inventory requiring attention.

---

# 11. Warehouse Management

The warehouse module provides CRUD functionality for warehouses.

Supported operations:

* Create warehouse
* View warehouse
* Update warehouse
* Delete warehouse
* Associate inventory with warehouse

Warehouse information is used when performing inventory operations and tracking stock locations.

---

# 12. Category Management

Categories provide organizational structure for products.

Supported operations:

* Create category
* View categories
* Update category
* Delete category

Categories can be used for filtering and organizing inventory.

---

# 13. Inventory Logs

Every relevant inventory movement can generate a corresponding inventory log.

Logs provide traceability for:

* Product
* Quantity
* Movement type
* Warehouse
* Date/time
* Related operational information

This creates an auditable history of stock movement.

---

# 14. Bill of Materials (BOM)

The BOM module defines the raw materials required to produce a finished product.

A BOM establishes a relationship between:

```text
Finished Product
       │
       ├── Raw Material A
       ├── Raw Material B
       ├── Raw Material C
       └── Raw Material D
```

A BOM can contain:

* Finished product
* Required raw materials
* Required quantities
* Unit information
* Production-related data

BOMs are used by the Production module when calculating material requirements.

---

# 15. Production Management

The Production module manages production orders and manufacturing workflows.

The module provides:

* Production orders
* BOM selection
* Multiple BOM selection
* Material requirements
* Material consumption
* Production status
* Production checklist
* Material bottleneck identification
* Production capacity calculation

---

# 16. Production Order Workflow

A typical production workflow is:

```text
Create Production Order
          ↓
Select Required BOM(s)
          ↓
Determine Material Requirements
          ↓
Check Available Materials
          ↓
Identify Bottlenecks
          ↓
Start Production
          ↓
Track Production Progress
          ↓
Record Material Consumption
          ↓
Complete Production
```

Production orders can be associated with business requirements and operational quantities.

---

# 17. Material Consumption

The system tracks material consumption during production.

This allows the organization to distinguish between:

* Planned material requirements
* Available material
* Consumed material
* Remaining material

Material consumption information can also support inventory updates and production reporting.

---

# 18. Production Checklist

Production orders can be progressed through operational checklist items.

The checklist provides visibility into the current state of a production process.

Example:

```text
Production Order
      │
      ├── Materials Checked
      ├── Materials Issued
      ├── Production Started
      ├── Production In Progress
      ├── Quality / Completion Check
      └── Production Completed
```

The exact checklist items can be configured according to the implemented workflow.

---

# 19. Material Bottleneck Calculation

The production system can determine whether sufficient raw materials are available for a requested production quantity.

Conceptually:

```text
Required Material
        -
Available Material
        =
Material Shortage
```

If available inventory is insufficient, the system can identify the relevant material as a production bottleneck.

---

# 20. Production Capacity Calculator

The Production module contains a capacity calculator to estimate production capability based on available materials and BOM requirements.

The calculator helps answer:

> How many units can currently be produced with the available materials?

For each required raw material:

```text
Available Quantity
÷
Quantity Required Per Finished Unit
```

The limiting material determines the maximum producible quantity.

---

# 21. CRM — Customer Relationship Management

The CRM module manages customer relationships, leads, sales activities, orders, payments, and customer history.

The CRM includes:

* Customer management
* Lead management
* Sales pipeline
* Salesperson assignment
* Customer portfolio
* Orders
* Payments
* Follow-ups
* Customer history
* Negotiation notes
* Stage history

---

# 22. CRM Lead-to-Customer Workflow

The CRM supports a lead-oriented workflow.

```text
Lead
 │
 ▼
Initial Contact
 │
 ▼
Qualification
 │
 ▼
Negotiation
 │
 ▼
Verification
 │
 ▼
Active Dealer / Customer
 │
 ▼
Orders & Payments
```

A lead can progress through defined pipeline stages based on business activity.

---

# 23. CRM Sales Pipeline

The system supports operational pipeline stages such as:

```text
LEAD
RINGING
NEGOTIATION
CATALOG_SHARED
VERIFICATION
ACTIVE_DEALER
SUPPLIER
DELAYED_PAYMENT
CLOSED
NO_DEALER
```

Pipeline stages allow sales personnel to understand the current state of each customer relationship.

---

# 24. Customer Portfolio

The customer portfolio provides a consolidated view of customer activity.

Depending on the implemented records, this can include:

* Customer information
* Assigned salesperson
* Orders
* Payments
* Contact history
* Follow-up information
* Negotiation notes
* Pipeline history
* Account information

The purpose is to provide sales personnel with the relevant customer context from a single location.

---

# 25. Salesperson Assignment

Customers can be assigned to salespeople.

The system supports:

* Assigned salesperson
* Salesperson-specific customer lists
* Customer ownership
* Sales follow-up tracking

This helps distribute and manage customer relationships across the sales team.

---

# 26. Customer Follow-Ups

CRM records can contain follow-up information such as:

* Last contact date
* Next follow-up date
* Next action
* Negotiation notes

This allows sales teams to maintain continuity between customer interactions.

---

# 27. Order Management

Orders are associated with customers and can contain multiple products.

An order generally contains:

* Customer
* Order items
* Product information
* Quantities
* Pricing
* Order totals
* Order status
* Payment information
* Operational metadata

Order items can preserve relevant product information at the time of ordering.

---

# 28. Payment Management

Payments are associated with customer orders/accounts.

Payment functionality supports recording financial transactions related to customers.

Depending on the workflow, payment information can be used for:

* Paid amount
* Outstanding amount
* Payment history
* Account status
* Due-date tracking

---

# 29. Accounts Module

The Accounts module provides visibility into financial and receivable information associated with business transactions.

The module includes functionality related to:

* Customer accounts
* Payments
* Outstanding amounts
* Due dates
* Account records
* Financial exports

---

# 30. Due Dates

The Accounts area includes due-date tracking.

This allows users to identify accounts requiring payment follow-up.

Typical workflow:

```text
Customer Account
      ↓
Outstanding Amount
      ↓
Due Date
      ↓
Follow-Up
      ↓
Payment Recorded
      ↓
Account Updated
```

---

# 31. Dispatch Management

The Dispatch module manages the operational dispatch of customer orders.

Typical workflow:

```text
Customer Order
      ↓
Order Ready
      ↓
Dispatch Created
      ↓
Items Prepared
      ↓
Dispatch Status Updated
      ↓
Order Dispatched
```

Dispatch records provide visibility into outbound order fulfillment.

---

# 32. Attendance & HR

The Attendance / HR module provides employee and attendance management functionality.

Core functionality includes:

* Employee management
* Employee records
* Attendance tracking
* Attendance status
* HR-related operational information
* Attendance reports
* Excel export
* PDF export

The module is intended for internal workforce administration.

---

# 33. Reports

The Reports functionality provides operational data in a structured format.

Reports can cover areas including:

* Inventory
* Production
* Attendance
* Dispatch
* Accounts
* CRM

The reporting layer is designed to provide management visibility into operational data.

---

# 34. Data Export

The application supports exporting operational information.

Supported formats include:

* Excel
* PDF

Export functionality is available for relevant modules such as:

```text
Inventory
Attendance
Production
Dispatch
Accounts
CRM
```

Exports are generated from the application's current data and can be used for reporting, analysis, and record keeping.

---

# 35. Frontend Architecture

The frontend is built using React and TypeScript.

A reusable component-based architecture is used to keep interfaces consistent.

Common UI building blocks include:

* Layout components
* Sidebar
* Topbar
* Page containers
* Stat cards
* Tables
* Forms
* Modals
* Filters
* Search interfaces
* Tabs
* Status indicators

---

# 36. Application Layout

The administrative application follows a common layout structure.

```text
┌──────────────────────────────────────────────┐
│                    Topbar                    │
├──────────────┬───────────────────────────────┤
│              │                               │
│   Sidebar    │          Page Content         │
│              │                               │
│  Dashboard   │                               │
│  Inventory   │                               │
│  Production  │                               │
│  CRM         │                               │
│  Dispatch    │                               │
│  Accounts    │                               │
│  Attendance  │                               │
│  Reports     │                               │
│              │                               │
└──────────────┴───────────────────────────────┘
```

The interface is designed to remain usable across desktop and mobile screen sizes.

---

# 37. API Architecture

The backend follows a REST API architecture.

A typical request flow is:

```text
Frontend
   │
   ▼
Axios Request
   │
   ▼
Express Route
   │
   ▼
Authentication Middleware
   │
   ▼
Authorization Middleware
   │
   ▼
Controller
   │
   ▼
Service / Business Logic
   │
   ▼
Mongoose Model
   │
   ▼
MongoDB
```

The API is responsible for validation, authorization, business logic, database operations, and response formatting.

---

# 38. Backend Structure

The backend is organized around common server-side responsibilities.

### Controllers

Handle incoming requests and generate API responses.

### Routes

Define API endpoints and connect them to controllers.

### Models

Define MongoDB document structures through Mongoose schemas.

### Middleware

Handle concerns such as:

* Authentication
* Authorization
* Error handling
* Request processing

### Services

Contain reusable business logic where required.

### Utilities

Contain reusable helper functionality such as:

* Export generation
* Formatting
* Validation
* Other shared utilities

---

# 39. Database

MongoDB is used as the primary database.

Mongoose provides:

* Schema definitions
* Model abstraction
* Validation
* Relationships through ObjectId references
* Query functionality

The database contains records corresponding to the application's operational modules.

Major data domains include:

```text
Users
Categories
Warehouses
Products
Inventory Logs
BOMs
Production Orders
Material Consumption
Customers
Orders
Payments
Dispatches
Employees
Attendance
Accounts
```

---

# 40. Data Relationships

The system uses MongoDB references to associate related records.

Examples:

```text
Customer
   │
   ├── Orders
   ├── Payments
   └── Account Information
```

```text
Product
   │
   ├── Category
   ├── Warehouse
   ├── Inventory Logs
   └── BOM / Production Relationships
```

```text
Production Order
   │
   ├── BOM
   ├── Raw Materials
   ├── Material Consumption
   └── Production Status
```

---

# 41. Environment Variables

Environment-specific configuration should be stored in environment variables rather than hard-coded in source files.

## Frontend

Typical configuration includes:

```env
VITE_API_URL=https://your-backend-domain
```

## Backend

Typical configuration includes:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Additional variables may be required depending on enabled services.

### Important

Environment files containing credentials or secrets should not be committed to source control.

Use:

```text
.env
```

and configure appropriate `.gitignore` rules.

---

# 42. Local Development Setup

## Prerequisites

Install:

* Node.js
* npm
* MongoDB / MongoDB Atlas access
* Git

For Android development:

* Android Studio
* Android SDK
* Java / Android development environment

---

## Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

---

# 43. Backend Installation

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```text
.env
```

Configure the required environment variables.

Start the development server:

```bash
npm run dev
```

The backend should then be available on the configured port.

---

# 44. Frontend Installation

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment variables.

Start the development server:

```bash
npm run dev
```

The frontend will display the development URL provided by the development server.

---

# 45. Production Build

## Frontend

```bash
npm run build
```

The generated production build can then be deployed to the configured hosting provider.

## Backend

The backend should be compiled according to the project's TypeScript configuration.

A typical workflow is:

```bash
npm run build
npm start
```

The exact scripts depend on the package configuration.

---

# 46. Deployment Architecture

The production system uses separate hosting for the frontend, backend, and database.

```text
                  Users
                    │
                    ▼
            ┌───────────────┐
            │    Vercel     │
            │   Frontend    │
            └───────┬───────┘
                    │
                    │ HTTPS API
                    ▼
            ┌───────────────┐
            │    Render     │
            │    Backend    │
            └───────┬───────┘
                    │
                    │ MongoDB Driver
                    ▼
            ┌───────────────┐
            │ MongoDB Atlas │
            │   Database    │
            └───────────────┘
```

---

# 47. Frontend Deployment

The frontend can be deployed through Vercel.

Deployment requires:

1. Connect the frontend repository.
2. Configure the build command.
3. Configure the output directory.
4. Add required environment variables.
5. Deploy the application.

The frontend API URL must point to the production backend.

Example:

```env
VITE_API_URL=https://api.example.com
```

---

# 48. Backend Deployment

The backend can be deployed through Render or another Node.js-compatible hosting provider.

Required configuration includes:

* Build command
* Start command
* Environment variables
* MongoDB connection string
* JWT secret
* CORS configuration

The backend must be accessible through HTTPS in production.

---

# 49. CORS Configuration

Because the frontend and backend are deployed separately, the backend must allow requests from the configured frontend origin.

Production CORS configuration should explicitly allow the application's frontend domain.

Avoid using unrestricted CORS in production unless there is a specific architectural requirement.

---

# 50. Mobile Application

The web application can be packaged as an Android application using Capacitor.

The mobile architecture is:

```text
React Web Application
        │
        ▼
     Capacitor
        │
        ▼
 Android Project
        │
        ▼
      APK
```

The application communicates with the same backend API used by the web application.

---

# 51. Android Build Workflow

After configuring the frontend:

```bash
npm run build
```

Sync the web application with Capacitor:

```bash
npx cap sync
```

Open the Android project:

```bash
npx cap open android
```

The Android project can then be built using Android Studio.

---

# 52. API Testing

Postman can be used to test backend endpoints independently from the frontend.

API testing should cover:

* Authentication
* CRUD operations
* Validation
* Authorization
* Inventory transactions
* Production workflows
* CRM operations
* Orders
* Payments
* Dispatch
* Attendance
* Reports

A typical test sequence is:

```text
Login
  ↓
Obtain JWT
  ↓
Set Authorization Header
  ↓
Call Protected Endpoint
  ↓
Validate Response
```

---

# 53. Error Handling

The backend should return appropriate HTTP status codes for different outcomes.

Common examples:

```text
200 — Successful request
201 — Resource created
400 — Invalid request
401 — Authentication required
403 — Insufficient permissions
404 — Resource not found
409 — Conflict
500 — Server error
```

Frontend interfaces should display meaningful error states instead of silently failing.

---

# 54. Security Considerations

The application uses several standard security mechanisms.

### Authentication

JWT authentication protects private API endpoints.

### Authorization

Role-based access controls access to protected functionality.

### Password Security

Passwords should never be stored as plain text.

### Environment Secrets

Database credentials and authentication secrets should be stored in environment variables.

### API Protection

Protected routes should validate authentication before performing database operations.

### Production HTTPS

Production frontend and backend communication should use HTTPS.

---

# 55. Data Validation

Validation should occur before data is persisted.

Validation responsibilities include:

* Required fields
* Data types
* Numeric values
* ObjectId references
* Quantity constraints
* Business rules
* Authentication requirements

Both frontend and backend validation can be used, but backend validation remains authoritative.

---

# 56. Business Workflow Overview

The major operational workflows connect multiple modules.

## Inventory → Production

```text
Raw Materials
     ↓
Inventory
     ↓
BOM
     ↓
Production Order
     ↓
Material Availability
     ↓
Production
     ↓
Material Consumption
     ↓
Finished Product
```

## CRM → Order → Dispatch

```text
Lead
 ↓
Customer
 ↓
Order
 ↓
Payment / Account
 ↓
Dispatch
```

## Attendance → Reports

```text
Employee
   ↓
Attendance
   ↓
Attendance Records
   ↓
Reports
   ↓
Excel / PDF Export
```

---

# 57. Module Dependency Overview

```text
                    Authentication
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    Inventory          CRM             Attendance
        │                 │                 │
        ▼                 ▼                 │
       BOM              Orders              │
        │                 │                 │
        ▼                 ▼                 │
   Production         Payments              │
        │                 │                 │
        └──────────┬──────┘                 │
                   ▼                        │
                Dispatch                    │
                   │                        │
                   └──────────┬─────────────┘
                              ▼
                           Reports
```

---

# 58. Responsive Design

The frontend is designed to support multiple screen sizes.

Responsive considerations include:

* Mobile-friendly navigation
* Responsive tables
* Scrollable data areas
* Adaptive forms
* Responsive modals
* Flexible grid layouts
* Mobile-friendly buttons and controls

The mobile experience uses the same backend and business logic as the web application.

---

# 59. UI Design Principles

The interface follows a functional enterprise application approach.

Primary principles:

* Clear information hierarchy
* Consistent spacing
* Reusable components
* Clear status indicators
* Searchable data
* Tabular presentation for operational records
* Simple CRUD interfaces
* Responsive layouts
* Minimal unnecessary interaction

The primary objective is operational usability rather than decorative complexity.

---

# 60. CRUD Convention

Standard CRUD functionality follows:

```text
Create
Read
Update
Delete
```

For example, a product workflow may be:

```text
Create Product
      ↓
View Product
      ↓
Edit Product
      ↓
Delete Product
```

CRUD interfaces generally use:

* Tables
* Search
* Filters
* Forms
* Modals
* Confirmation actions
* Status indicators

---

# 61. Recommended Development Workflow

When making changes to the application:

```text
Requirement
    ↓
Database / Schema Review
    ↓
Backend API
    ↓
API Testing
    ↓
Frontend Integration
    ↓
UI Testing
    ↓
Responsive Testing
    ↓
Production Build
    ↓
Deployment
```

Backend changes should be tested independently before frontend integration.

---

# 62. Testing Checklist

Before production deployment, verify:

### Authentication

* Login works
* Invalid credentials are rejected
* Protected routes require authentication
* Role restrictions work

### Inventory

* Categories CRUD
* Warehouses CRUD
* Products CRUD
* Stock IN
* Stock OUT
* Inventory logs
* Stock status

### Production

* BOM creation
* BOM selection
* Production order creation
* Material availability
* Bottleneck calculation
* Production checklist
* Material consumption
* Capacity calculation

### CRM

* Customer creation
* Lead management
* Pipeline stages
* Salesperson assignment
* Follow-ups
* Orders
* Payments
* Customer history

### Dispatch

* Dispatch creation
* Dispatch status
* Order-to-dispatch workflow

### Accounts

* Customer accounts
* Payments
* Due dates
* Outstanding amounts

### Attendance / HR

* Employee records
* Attendance records
* Attendance status
* Reports

### Reports

* Excel export
* PDF export
* Correct data
* Correct formatting

### Mobile

* Android build
* API connectivity
* Authentication
* Navigation
* Responsive UI

---

# 63. Production Checklist

Before publishing a production release:

* [ ] Production MongoDB connection configured
* [ ] Backend environment variables configured
* [ ] Frontend API URL configured
* [ ] JWT secret configured
* [ ] CORS configured
* [ ] Database connectivity verified
* [ ] Authentication tested
* [ ] Role-based access tested
* [ ] All primary modules tested
* [ ] Export functionality tested
* [ ] Responsive UI tested
* [ ] Android application tested
* [ ] Production frontend deployed
* [ ] Production backend deployed
* [ ] API health verified
* [ ] No development credentials committed
* [ ] No sensitive environment files committed

---

# 64. Environment Separation

The application should maintain separate configurations for:

```text
Development
Staging
Production
```

Each environment should use its own:

* API URL
* Database configuration
* Authentication secrets
* Allowed frontend origins
* Deployment configuration

This prevents development configuration from being accidentally used in production.

---

# 65. Git Workflow

A typical Git workflow is:

```text
Create / Update Feature
        ↓
Local Testing
        ↓
Commit Changes
        ↓
Push to Repository
        ↓
Review / Merge
        ↓
Deploy
```

Commit messages should describe the actual change.

Examples:

```text
feat: add production capacity calculator
fix: correct inventory stock calculation
feat: add customer due dates
fix: update CRM order workflow
```

---

# 66. Maintenance

Regular maintenance should include:

* Database backups
* Dependency updates
* Security updates
* Error monitoring
* API health checks
* Production log review
* Database integrity checks
* User access review

Major schema changes should be tested before deployment.

---

# 67. Troubleshooting

## Frontend cannot connect to backend

Check:

1. Frontend API environment variable
2. Backend deployment status
3. Backend URL
4. CORS configuration
5. Browser network errors
6. Backend logs

---

## API returns 404

Check:

1. API route path
2. HTTP method
3. Backend deployment
4. Frontend API base URL
5. Route registration

---

## API returns 401

Check:

1. JWT token exists
2. Authorization header is present
3. Token has not expired
4. Backend JWT configuration is correct

---

## API returns 403

Check:

1. User role
2. Route authorization rules
3. Role configuration

---

## MongoDB connection fails

Check:

1. `MONGO_URI`
2. MongoDB Atlas availability
3. Database user credentials
4. IP/network access configuration
5. Backend environment variables

---

## Android application cannot connect

Check:

1. Production API URL
2. Capacitor configuration
3. Latest frontend build
4. `npx cap sync`
5. Android network configuration
6. Backend availability

---

# 68. API Documentation

The backend should maintain documentation for each API module.

Recommended documentation format:

```text
METHOD
ENDPOINT

Authentication:
Required / Not Required

Role:
Allowed roles

Request:
Required fields

Response:
Returned data

Errors:
Possible error responses
```

Example:

```text
POST /api/products

Authentication:
Required

Role:
Inventory / Admin

Request:
{
    "name": "...",
    "category": "...",
    "type": "RAW",
    "quantity": 100
}

Response:
Created product object
```

The exact endpoints should be maintained according to the backend route definitions.

---

# 69. Scalability Considerations

The architecture allows additional modules and functionality to be added without directly coupling the frontend to the database.

Potential scaling areas include:

* Additional reporting
* More granular permissions
* Advanced analytics
* Additional inventory locations
* Expanded production workflows
* Additional CRM automation
* Notification systems
* Audit logging
* Additional mobile functionality

New functionality should follow the existing modular architecture rather than introducing direct database access from the frontend.

---

# 70. Data Integrity Principles

Operational data should remain consistent across related modules.

For example:

```text
Order
  ↓
Payment
  ↓
Account
  ↓
Dispatch
```

and:

```text
BOM
  ↓
Production Order
  ↓
Material Consumption
  ↓
Inventory
```

Changes to one operational record should follow the defined business rules so that related records remain consistent.

---

# 71. Access Roles Summary

| Role            | Primary Responsibility                   |
| --------------- | ---------------------------------------- |
| Founder / Admin | Overall system administration and access |
| Inventory       | Products, categories, warehouses, stock  |
| Production      | BOMs, production orders, materials       |
| Accountant      | Accounts, payments, due dates            |
| CRM             | Customers, leads, sales pipeline, orders |
| Attendance / HR | Employees and attendance                 |

Actual permissions are controlled by the application's authorization implementation.

---

# 72. Core Modules Summary

| Module          | Main Responsibility                |
| --------------- | ---------------------------------- |
| Authentication  | Login, JWT, protected access       |
| Inventory       | Products and stock                 |
| Categories      | Product categorization             |
| Warehouses      | Stock locations                    |
| Inventory Logs  | Stock movement history             |
| BOM             | Production material definitions    |
| Production      | Manufacturing workflow             |
| CRM             | Customers and sales                |
| Orders          | Customer orders                    |
| Payments        | Payment records                    |
| Dispatch        | Order fulfillment                  |
| Accounts        | Financial account tracking         |
| Attendance / HR | Employee and attendance management |
| Reports         | Operational reporting              |
| Exports         | Excel and PDF generation           |

---

# 73. End-to-End Business Flow

The overall system connects the organization's major operational activities.

```text
                         ┌──────────────┐
                         │     USER     │
                         └──────┬───────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Authentication  │
                       └────────┬────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
       INVENTORY               CRM             ATTENDANCE
            │                   │                   │
            │                   ▼                   │
            │                ORDERS                 │
            │                   │                   │
            ▼                   ▼                   │
           BOM              PAYMENTS                │
            │                   │                   │
            ▼                   ▼                   │
       PRODUCTION            ACCOUNTS                │
            │                   │                   │
            └─────────────┬─────┘                   │
                          ▼                         │
                       DISPATCH                     │
                          │                         │
                          └────────────┬────────────┘
                                       ▼
                                    REPORTS
                                       │
                            ┌──────────┴──────────┐
                            ▼                     ▼
                         EXCEL                  PDF
```

---

# 74. Project Objectives

The system is designed to provide:

1. Centralized operational data
2. Controlled user access
3. Inventory visibility
4. Production tracking
5. Customer and sales management
6. Payment and account tracking
7. Dispatch visibility
8. Employee attendance management
9. Operational reporting
10. Exportable business records
11. Web and mobile accessibility

---

# 75. Final System

The completed application provides a centralized platform connecting:

**Inventory → Production → CRM → Orders → Accounts → Dispatch → Attendance → Reports**

with authentication, role-based access, REST APIs, MongoDB persistence, responsive frontend interfaces, export functionality, and Android application support.

The system is designed as an operational ERP platform where each module works independently while sharing the underlying business data required for end-to-end workflows.
