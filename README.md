# StockFlow | Enterprise Inventory & Business Intelligence Suite

StockFlow is a high-performance MERN stack application designed for small-to-medium businesses to manage inventory, track sales ledger activity, and generate professional financial intelligence reports.

Built with a focus on **Data Integrity** and **Executive UX**, the platform transforms raw inventory data into actionable business insights.

## 🚀 Live Demo

[Insert your Vercel Link Here]

## 🛠️ Key Features

### 📊 Business Intelligence Dashboard

- **Dynamic Analytics:** Real-time visualization of revenue trends using Recharts.
- **Metric Cards:** Instant visibility into Gross Revenue, Outstanding Dues, and Low-stock alerts.
- **Global Search Integration:** A centralized search bar that filters analytics across the entire dashboard.

### 🧾 Unified Order Workstation (POS)

- **Hybrid Functionality:** A single, robust interface for Creating, Auditing (View-only), and Modifying existing transactions.
- **Live Ledger:** Automated "Due Balance" calculations and subtotal tracking as items are added/removed.
- **Persistence Logic:** Complex data hydration ensures that historical prices (price at purchase) are preserved even if current inventory prices change.

### 📄 Financial Reporting & Data Portability

- **PDF Generation:** One-click professional invoice and business report generation using `jspdf` and `jspdf-autotable`.
- **CSV Export:** Native data serialization for Excel-compatible sales exports.

### 🔍 Search & Filtering

- **URL-State Synchronization:** Uses URL parameters as a "Single Source of Truth," allowing users to share specific filtered views.
- **Backend-Driven Search:** Implemented Regex-based search on the server-side for lightning-fast results across large datasets.

## 💻 Tech Stack

**Frontend:**

- React 19 (Vite)
- Redux Toolkit & RTK Query (State & API Management)
- Tailwind CSS (Modern, Responsive UI)
- Lucide React (Iconography)

**Backend:**

- Node.js & Express.js
- MongoDB & Mongoose (Document Database)
- JWT (Architecture ready for Authentication)

## 🏗️ Engineering Highlights (Interview Discussion Points)

- **Optimized Rendering:** Prevented cascading render cycles during complex form hydration by consolidating state and utilizing the JavaScript task queue (setTimeout/0).
- **Architecture:** Implemented a Monorepo structure with a clear separation between client-side UI and server-side business logic.
- **Efficient API Usage:** Leveraged RTK Query tags for automatic cache invalidation, ensuring the Dashboard always reflects the latest sales without manual refreshes.
- **UX Design:** Applied a "Mobile-First" responsive strategy, ensuring the POS workstation is usable on tablets and desktops alike.

## ⚙️ Setup & Installation

1. **Clone the Project:**
   ```bash
   git clone [https://github.com/your-username/stockflow.git](https://github.com/your-username/stockflow.git)
   cd stockflow
   ```
2. **Server Setup:**
   ```bash
    cd server
    npm install
    # Create a .env file with MONGO_URI and PORT
    npm start
   ```
3. **Client Setup:**
   ```bash
    cd ../client
    npm install
    # Set VITE_API_URL in your environment variables
    npm run dev
   ```
   Developed by Yuvas Pravin

### Why this README works for your interview:

1.  **Engineering Highlights:** This is the most important section. It uses "Senior Developer" keywords like _Cascading Renders_, _Data Hydration_, and _Cache Invalidation_.
2.  **Visual Hierarchy:** It’s easy to scan. Recruiters usually spend less than 30 seconds on a README; this one hits all the high points quickly.
3.  **The "Workstation" Mention:** Calling your "Add Order" page a **"Workstation"** sounds much more professional and enterprise-ready.
4.  **Tech Stack Clarity:** It shows you're using modern versions (React 19, Vite) and advanced tools (RTK Query).

**One last tip:** Before you push, make sure your **Vercel link** is working and paste it into the "Live Demo" section at the top.
