/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: API endpoints for managing sales (Pharmacy POS)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SaleItem:
 *       type: object
 *       properties:
 *         medicineId:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d111
 *         medicineName:
 *           type: string
 *           example: Napa 500mg
 *         batchNo:
 *           type: string
 *           example: BATCH-001
 *         quantity:
 *           type: number
 *           example: 2
 *         sellingPrice:
 *           type: number
 *           example: 10
 *         purchasePrice:
 *           type: number
 *           example: 7
 *
 *     Sale:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d222
 *         organizationId:
 *           type: string
 *         branchId:
 *           type: string
 *         cashierId:
 *           type: string
 *         invoiceNo:
 *           type: string
 *           example: INV-1001
 *         customerName:
 *           type: string
 *           example: John Doe
 *         customerPhone:
 *           type: string
 *           example: 017XXXXXXXX
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         subtotal:
 *           type: number
 *           example: 200
 *         discount:
 *           type: number
 *           example: 10
 *         tax:
 *           type: number
 *           example: 5
 *         totalAmount:
 *           type: number
 *           example: 185
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, mobile]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerPhone
 *               - items
 *               - paymentMethod
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: John Doe
 *               customerPhone:
 *                 type: string
 *                 example: 017XXXXXXXX
 *               discount:
 *                 type: number
 *                 example: 5
 *               tax:
 *                 type: number
 *                 example: 2
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, mobile]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineName:
 *                       type: string
 *                       example: napa 500mg
 *                     batchNo:
 *                       type: string
 *                       example: BATCH-001
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     sellingPrice:
 *                       type: number
 *                       example: 4
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Medicine or batch not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/sales:
 *   get:
 *     summary: Get list of sales (with optional medicine filter)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: medicine
 *         schema:
 *           type: string
 *         description: Search by medicine name (e.g. napa 500mg)
 *     responses:
 *       200:
 *         description: List of filtered sales
 *       404:
 *         description: No sales found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   get:
 *     summary: Get sale information by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
 *       404:
 *         description: Sale not found
 *       409:
 *         description: Invalid ID format
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   patch:
 *     summary: Update a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Updated Name
 *               customerPhone:
 *                 type: string
 *               discount:
 *                 type: number
 *               tax:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, mobile]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineName:
 *                       type: string
 *                     batchNo:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale not found
 *       409:
 *         description: Conflict error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   delete:
 *     summary: Delete a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *       404:
 *         description: Sale not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Internal server error
 */
