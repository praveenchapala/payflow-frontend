# PayFlow — Frontend

A full-stack payment gateway integration project built with React and Vite, integrating Razorpay Checkout in Test Mode.

## Overview

PayFlow provides a simple payment interface that communicates with a Spring Boot backend to create payment orders and launch Razorpay Checkout. The project demonstrates how a frontend application interacts with a backend API during a payment workflow.

## Features

- React-based payment interface
- Integration with a Spring Boot backend through HTTP APIs
- Razorpay Checkout integration in Test Mode
- Backend-driven order creation
- Environment-based backend API configuration
- Payment callback handling on the frontend

> **Current status:** Razorpay Checkout opens successfully. Backend payment-signature verification and database persistence are planned next.

## Tech Stack

- **Frontend:** React
- **Build tool:** Vite
- **Language:** JavaScript
- **Styling:** CSS
- **Payment gateway:** Razorpay Checkout
- **Backend:** Java, Spring Boot, Maven
- **Version control:** Git and GitHub

## Project Structure

```text
payflow-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Prerequisites

Install the following before running the application:

- Node.js and npm
- Git
- The PayFlow Spring Boot backend running locally
- Razorpay Test Mode credentials configured securely in the backend

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/praveenchapala/payflow-frontend.git
cd payflow-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend URL

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

The `.env.example` file provides the configuration template. Do not commit your local `.env` file.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

`http://localhost:5173`

### 5. Run the backend

Ensure the PayFlow Spring Boot backend is running on port `8080` and its required Razorpay environment variables are configured.

## Payment Workflow

1. The user initiates a payment from the PayFlow interface.
2. The frontend requests an order from the backend.
3. The backend creates a Razorpay order.
4. The frontend receives the order details.
5. Razorpay Checkout opens for the user.
6. The frontend receives the Checkout response.

A browser callback alone does not establish that a payment has been verified. Server-side signature verification is required before treating a payment as verified.

## Security Notes

- Razorpay secret credentials must remain on the backend.
- Never expose the Razorpay secret key through frontend environment variables.
- Keep local `.env` files out of version control.
- Do not treat client-side payment responses as authoritative proof of payment.

## Planned Improvements

- Backend payment-signature verification
- Payment success and failure states
- Persistent transaction history
- Improved loading and error handling
- Automated tests
- Frontend and backend deployment

## Related Repository

**Backend:** https://github.com/praveenchapala/payflow-backend

## Learning Objectives

This project explores frontend-to-backend API integration, payment gateway checkout flows, environment configuration, and secure payment processing concepts.
