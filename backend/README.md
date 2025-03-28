# Laundry App Backend

Backend service for the Laundry App, built with NestJS.

## Features

- Order Management
- Customer Management
- Service Management
- Report Generation
- JWT Authentication

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL (v12 or later)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd laundry-app-backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration.

5. Create the database:
```sql
CREATE DATABASE laundry_db;
```

## Running the App

1. Development mode:
```bash
npm run start:dev
# or
yarn start:dev
```

2. Production mode:
```bash
npm run build
npm run start:prod
# or
yarn build
yarn start:prod
```

## API Documentation

The API documentation is available at `/api` when running the app.

## Testing

```bash
# unit tests
npm run test
# or
yarn test

# e2e tests
npm run test:e2e
# or
yarn test:e2e
```

## License

[MIT licensed](LICENSE) 