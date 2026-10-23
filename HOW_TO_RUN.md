# SouthColours Application — Complete Run & Setup Guide

This document provides a clean, step-by-step developer manual for running the entire SouthColours ecosystem: the **Spring Boot backend**, **MySQL database**, **Customer mobile app**, and **Admin mobile app**.

---

## 1. System Architecture Overview

| Component | Technology | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **Backend API** | Spring Boot 3.3 / Java 21 | `8080` | REST API, JWT Authentication, Hibernate JPA catalog and order management |
| **Database** | MySQL 8.0 | `3306` | Schema: `southcolours_db`, User: `southcolours_user` |
| **Customer App** | React Native / Expo | `8081` | E-commerce shopping experience for mobile users |
| **Admin App** | React Native / Expo | `8082` | Store administration portal (product, category, stock management) |

---

## 2. Prerequisites & Installed Paths

Make sure the following prerequisites are installed on your machine:

- **Java JDK 21**: Installed at `C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot`
- **Apache Maven 3.9**: Installed at `C:\Users\jadet\maven\apache-maven-3.9.6\bin\mvn.cmd`
- **Node.js (v20+ / v24)**: Installed system-wide
- **MySQL Server 8.0**: Installed as a Windows Service running on port `3306`
- **Expo Go App**: Installed on your physical Android / iOS device (from Google Play Store / Apple App Store)

---

## 3. Step-by-Step Running Guide

### Step 1: Start the MySQL Database Service
Ensure the local MySQL service is active:
```powershell
Get-Service -Name MySQL80 | Start-Service
```
*Database Credentials:*
- Database Name: `southcolours_db`
- Username: `southcolours_user`
- Password: `southcolours_password`

---

### Step 2: Start the Spring Boot Backend Server
Open a terminal in the project root:

1. **Check & Free Port 8080 (if previously occupied):**
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Run Spring Boot:**
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

3. **Verify Backend Health:**
   Open your browser or run:
   ```powershell
   Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/home-feed'
   ```
   You should receive a JSON response with `"success": true` and the 8 live categories.

---

### Step 3: Run the Customer Mobile App
Open a **new** terminal tab:

```powershell
cd apps/customer-mobile
npx expo start --clear
```

- **Running on Physical Device (Recommended):**
  - Make sure your mobile phone is connected to the **same Wi-Fi network** as your computer.
  - Open the **Expo Go** app on your phone.
  - Scan the QR code displayed in the terminal.
- **Running on Android Emulator:**
  - Press `a` in the terminal once the Metro bundler is ready.

---

### Step 4: Run the Admin Mobile App
Open another **new** terminal tab:

```powershell
cd apps/admin-mobile
npx expo start --port 8082 --clear
```

- Scan the QR code with **Expo Go** to access the Admin dashboard.
- From here, you can add products, customize categories, edit stock variants, and manage orders.

---

## 4. Connecting Physical Devices over Wi-Fi (LAN)

Both mobile applications dynamically detect your computer's local Wi-Fi IP (e.g. `192.168.1.63:8080`).

If your phone displays a network timeout or cannot reach the backend:
1. **Verify your computer's current Wi-Fi IP**:
   ```powershell
   ipconfig
   ```
2. **Allow inbound traffic on port 8080 through Windows Defender Firewall**:
   ```powershell
   New-NetFirewallRule -DisplayName "Spring Boot 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
   ```
3. Make sure your PC network profile is set to **Private** rather than Public so local LAN devices can communicate.

---

## 5. Troubleshooting & FAQ

| Problem | Cause | Quick Fix |
| :--- | :--- | :--- |
| **`Port 8080 was already in use`** | A prior Java process is still holding port 8080 in the background. | Run:<br>`Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess \| Stop-Process -Force` |
| **`Network Error` / `Failed to fetch` on phone** | Phone is not on the same Wi-Fi, or firewall blocked port 8080. | Check Wi-Fi connection, verify IP address, and add Windows Firewall rule for port 8080. |
| **Changes not updating in Expo app** | Expo Metro bundler cache is stale. | Stop Metro (`Ctrl + C`) and restart with cache reset: `npx expo start -c` |
| **Metro port conflict (Port 8081 busy)** | Running customer and admin app on the same default port. | Specify a distinct port for admin app: `npx expo start --port 8082` |

---

## 6. How to Save as a PDF (Whenever Needed)

If you or your team ever want this guide as a formatted PDF:
1. Open this file in your editor or browser (e.g., in VS Code / IDE with Markdown Preview).
2. Right-click &rarr; **Print** (or `Ctrl + P`).
3. Select **"Save as PDF"** / **"Microsoft Print to PDF"**.
