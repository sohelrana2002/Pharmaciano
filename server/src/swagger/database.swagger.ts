/**
 * @swagger
 * tags:
 *   - name: Database
 *     description: Database backup and export operations (Super Admin only)
 */

/**
 * @swagger
 * /api/v1/database/download:
 *   get:
 *     summary: Download full database backup
 *     tags: [Database]
 *     description: |
 *       **⚠️ Super Admin only** – Exports all collections from the database as a single JSON file.
 *
 *       - The file is automatically downloaded with the name `database-backup.json`.
 *       - Contains all documents from every collection in the database.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Database backup file downloaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 description: Array of documents from a collection
 *                 items:
 *                   type: object
 *               example:
 *                 users:
 *                   - _id: "60d21b4667d0d8992e610c85"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                 sales:
 *                   - _id: "60d21b4667d0d8992e610c86"
 *                     invoiceNo: "INV-001"
 *                     totalAmount: 250
 *             headers:
 *               Content-Disposition:
 *                 schema:
 *                   type: string
 *                   example: attachment; filename="database-backup.json"
 *               Content-Type:
 *                 schema:
 *                   type: string
 *                   example: application/json
 *
 *       401:
 *         description: Unauthorized – No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *
 *       403:
 *         description: Forbidden – User is not a Super Admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Only super admin can perform this operation
 *
 *       500:
 *         description: Server error – Database connection issue or internal failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */

// If you want to define a reusable parameter for authentication, you can add to components/securitySchemes (already present in your Swagger setup)
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
