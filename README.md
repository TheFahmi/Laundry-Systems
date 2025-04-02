# Laundry Management System

A comprehensive fullstack laundry management application with NestJS backend, PostgreSQL database, and Next.js frontend.

## System Overview

The Laundry Management System is an end-to-end solution for laundry businesses designed to automate and optimize daily operations, monitor business performance, and enhance customer experience. The system consists of an admin panel for internal management and a customer portal for a seamless user experience.

## Key Features

### Admin Panel
- **Analytics Dashboard**: Visualization of key business metrics including revenue, order count, and popular services
- **Customer Management**: Administration of customer information complete with history and preferences
- **Order Processing**: Order status tracking system with real-time updates
- **Service Catalog**: Service management with flexible pricing models (per kg, per item, flat rate)
- **Payment Management**: Multi-stage payment process with localStorage persistence
- **Reports and Analytics**: Comprehensive business insights with data visualization
- **Dark/Light Mode**: Dark and light interface mode support with Shadcn UI

### Payment System
- **2-Step Payment Flow**:
  - Step 1: Confirm customer and order information
  - Step 2: Process payment with 3 states (input, confirmation, success)
- **Multiple Payment Methods**: Support for Cash, Bank Transfer, QRIS, and E-Wallet
- **Data Persistence**: Payment status storage in localStorage to prevent data loss during refresh
- **Payment Validation**: Input validation for payment method and amount
- **Payment Confirmation**: Payment summary display for verification before processing
- **Success Status**: Successful payment confirmation display with transaction details
- **Print Support**: Option to print payment receipt

### Customer Portal
- **User Authentication**: Secure login and registration system
- **Order Management**: Order creation and tracking with intuitive interface
- **Notifications**: Order status and payment updates
- **Profile Management**: Customer information and preference updates
- **Order History**: Access to order history and reordering options

## Technologies Used

### Backend
- **NestJS**: Node.js framework for backend
- **TypeScript**: Static typing for safer development
- **PostgreSQL**: Relational database for data storage
- **TypeORM**: ORM for database management
- **JWT Authentication**: Token-based authentication system
- **Swagger**: Integrated API documentation

### Frontend
- **Next.js**: React framework with server-side rendering
- **React**: UI library for user interfaces
- **Shadcn UI**: UI components with dark mode support
- **Tailwind CSS**: CSS framework for responsive styling
- **React-Toastify**: Toast notifications for user feedback
- **LocalStorage API**: Client-side data persistence for uninterrupted experience
- **Chart.js**: Data visualization and charts for dashboard

## Installation and Configuration

### Prerequisites
- Node.js (v16.x or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
# Copy .env.example to .env and adjust
cp .env.example .env

# Create PostgreSQL database

# Run database migrations
npm run migration:run

# Run development server
npm run start:dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
# Copy .env.example to .env.local and adjust
cp .env.example .env.local

# Run development server
npm run dev
```

## Project Structure

```
laundry-management-system/
├── backend/             # NestJS API
│   ├── src/             # Backend source code
│   │   ├── modules/     # NestJS modules (customers, orders, payments, etc)
│   │   ├── migrations/  # Database migrations
│   │   └── db/          # Database configuration and connection
├── frontend/            # Next.js Application
│   ├── src/             # Frontend source code
│   │   ├── app/         # Next.js application routes
│   │   │   ├── (admin)/ # Admin panel routes
│   │   │   └── (customer)/ # Customer portal routes
│   │   ├── components/  # React components
│   │   │   ├── payments/ # Payment components
│   │   │   ├── orders/  # Order components
│   │   │   └── ui/      # Base UI components
│   │   ├── lib/         # Utility and helper functions
│   │   └── api/         # API services and data fetching
└── README.md            # Project documentation
```

## Payment Features

Our payment system features:

1. **Intuitive User Flow**:
   - Clear and easy-to-follow 2-step process
   - Visual step indicators showing progress

2. **Data Persistence**:
   - Payment status storage in localStorage
   - Payment session recovery after browser refresh
   - Multi-order management without data interference

3. **Responsive Interface**:
   - Responsive design for all screen sizes
   - Dark/light theme support
   - Visual confirmation for user actions

4. **Security and Validation**:
   - Real-time input validation
   - Prevention of double submissions
   - Error handling with clear messages

## Contribution

Contributions to improve the system are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[ISC](LICENSE)

## Contact

Project Name - [Email](mailto:email@example.com)

Project Link: [https://github.com/username/laundry-management-system](https://github.com/username/laundry-management-system)

## Docker Setup

This application now supports deployment with Docker. Here are the steps to run the application using Docker:

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application with Docker

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd laundry
   ```

2. Build and run containers with Docker Compose:
   ```bash
   docker-compose up -d
   ```

   This command will build and run three services:
   - **postgres**: PostgreSQL database
   - **backend**: NestJS API on http://localhost:3001
   - **frontend**: Next.js application on http://localhost:3000

3. View logs from all services:
   ```bash
   docker-compose logs -f
   ```

   Or view logs from a specific service:
   ```bash
   docker-compose logs -f frontend
   ```

4. Stop and remove containers:
   ```bash
   docker-compose down
   ```

### Development with Docker

For development, you can make changes to files and see changes directly:

1. Rebuild and restart a specific service after making changes:
   ```bash
   docker-compose up -d --build frontend
   ```

2. Run commands inside a container:
   ```bash
   docker-compose exec frontend sh
   ```

### Environment Variables

All environment variables are set within the `docker-compose.yml` file. For production environments, consider creating an `.env` file and using `env_file` in docker-compose.yml. 