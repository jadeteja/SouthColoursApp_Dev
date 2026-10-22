# Southcolours — E-Commerce Platform

Little Styles, Big Smiles — Premium Kids' & Ethnic Wear Fashion Platform.

## Architecture Overview
- **`apps/customer-mobile`**: React Native Expo application for customers (Android-first).
- **`apps/admin-mobile`**: React Native Expo application for store administrators.
- **`packages/theme`**: Shared styling tokens (Pink & White brand palette, typography, radii, spacing).
- **`packages/types`**: Shared domain models, API requests/responses, and enum definitions.
- **`packages/api-client`**: Axios-based API client with automatic token attachment and refresh logic.
- **`packages/validation`**: Zod schemas for auth, checkout, product management, and coupons.
- **`backend`**: Spring Boot 3.3.x (Java 21 LTS), Spring Security (JWT), Spring Data JPA, Flyway migrations, MySQL 8.4.
- **`infrastructure`**: Docker Compose setup for local development (MySQL, backend, local stack).

## Getting Started

Refer to `docs/` for architecture blueprints, API references, and deployment setup.
