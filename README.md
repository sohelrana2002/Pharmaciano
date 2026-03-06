# 💊 Pharmaciano API Server

Backend service for **Pharmaciano**, a pharmacy management system designed to manage medicines, inventory batches, organizations, branches, and suppliers efficiently.

This API provides secure and scalable endpoints for managing pharmacy operations such as inventory tracking, medicine management, supplier management, and organizational control.

---

## 🚀 Features

* 🏥 Organization management
* 🏬 Branch management
* 💊 Medicine management
* 📦 Inventory batch tracking
* 🧾 Supplier management
* 🔐 Authentication & authorization
* 📑 Request validation
* 📊 Structured API responses
* 📚 Interactive API documentation (Swagger)

---

## 🛠 Tech Stack

**Backend**

* Node.js
* Express.js
* TypeScript

**Database**

* MongoDB
* Mongoose

**API Documentation**

* Swagger (OpenAPI)

**Validation**

* Zod

**Authentication**

* JWT

---

## 📂 Project Structure

```
src
│
├── config
│   └── database.ts
│
├── controllers
│   ├── organization.controller.ts
│   ├── branch.controller.ts
│   ├── medicine.controller.ts
│   ├── inventoryBatch.controller.ts
│   └── supplier.controller.ts
│
├── models
│   ├── Organization.model.ts
│   ├── Branch.model.ts
│   ├── Medicine.model.ts
│   ├── InventoryBatch.model.ts
│   └── Supplier.model.ts
│
├── routes
│   ├── organization.routes.ts
│   ├── branch.routes.ts
│   ├── medicine.routes.ts
│   ├── inventoryBatch.routes.ts
│   └── supplier.routes.ts
│
├── validators
│
├── middlewares
│
├── constants
│
├── types
│
└── server.ts
```

---

# 📦 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/pharmaciano-server.git
cd pharmaciano-server
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the root directory.

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

### 4️⃣ Run the server

Development mode

```bash
npm run dev
```

Production build

```bash
npm run build
npm start
```

---

# 📚 API Documentation

Interactive Swagger documentation is available here:

👉 **API Docs:**
`http://localhost:5000/api-docs`

Or deployed version:

👉 `https://pharmaciano-backend.vercel.app/api-docs`

The documentation allows you to:

* View all API endpoints
* Test requests directly
* See request & response schemas
* Understand validation rules

---


# 🧪 Testing

You can test the APIs using:

* Swagger UI
* Postman

---

# 🤝 Contributing

Contributions are welcome.

Steps:

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Submit a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Sohel Rana**

Full Stack Developer
Node.js | Express | MongoDB | React | Next.js

---
