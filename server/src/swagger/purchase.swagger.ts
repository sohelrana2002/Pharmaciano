/**
 * @swagger
 * tags:
 *   - name: Purchases
 *     description: Purchase management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseItem:
 *       type: object
 *       properties:
 *         medicineId:
 *           type: string
 *         medicineName:
 *           type: string
 *         batchNo:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date
 *         quantity:
 *           type: number
 *         purchasePrice:
 *           type: number
 *         totalCost:
 *           type: number

 *     Purchase:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         organizationId:
 *           type: string
 *         branchId:
 *           type: string
 *         supplierId:
 *           type: string
 *         warehouseId:
 *           type: string
 *         purchaseNo:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, received]
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchaseItem'
 *         subtotal:
 *           type: number
 *         discount:
 *           type: number
 *         tax:
 *           type: number
 *         totalAmount:
 *           type: number
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, partial, paid]
 *         paidAmount:
 *           type: number
 *         dueAmount:
 *           type: number
 *         approvedBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time

 *     CreatePurchaseUser:
 *       type: object
 *       required:
 *         - items
 *         - supplier
 *         - warehouseName
 *       properties:
 *         supplier:
 *           type: string
 *         warehouseName:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - medicineName
 *               - quantity
 *             properties:
 *               medicineName:
 *                 type: string
 *               quantity:
 *                 type: number
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, partial, paid]
 *         paidAmount:
 *           type: number

 *     CreatePurchaseSuperAdmin:
 *       type: object
 *       required:
 *         - items
 *         - supplier
 *         - warehouseName
 *         - organizationName
 *         - branchName
 *       properties:
 *         supplier:
 *           type: string
 *         warehouseName:
 *           type: string
 *         organizationName:
 *           type: string
 *         branchName:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               medicineName:
 *                 type: string
 *               quantity:
 *                 type: number
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, partial, paid]
 *         paidAmount:
 *           type: number

 *     ReceivePurchase:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - medicineName
 *             properties:
 *               medicineName:
 *                 type: string
 *               batchNo:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               purchasePrice:
 *                 type: number
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, partial, paid]
 *         paidAmount:
 *           type: number
 *         discount:
 *           type: number
 *         tax:
 *           type: number

 *   parameters:
 *     purchaseId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Purchase ID

 *     page:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1

 *     limit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 10

 *     purchaseSearch:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search by purchase number

 *     status:
 *       in: query
 *       name: status
 *       schema:
 *         type: string
 *         enum: [pending, approved, received]

 *     paymentStatus:
 *       in: query
 *       name: paymentStatus
 *       schema:
 *         type: string
 *         enum: [unpaid, partial, paid]

 *     fromDate:
 *       in: query
 *       name: fromDate
 *       schema:
 *         type: string
 *         format: date

 *     toDate:
 *       in: query
 *       name: toDate
 *       schema:
 *         type: string
 *         format: date
 */

/**
 * @swagger
 * /api/v1/purchases:
 *   post:
 *     summary: Create a new purchase
 *     tags: [Purchases]
 *     description: |
 *       - Normal users: organization & branch from token
 *       - Super Admin: must provide organizationName & branchName
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreatePurchaseUser'
 *               - $ref: '#/components/schemas/CreatePurchaseSuperAdmin'
 *     responses:
 *       201:
 *         description: Purchase created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Medicine / Supplier / Warehouse not found
 *       409:
 *         description: Duplicate purchase
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases/{id}/approve:
 *   patch:
 *     summary: Approve purchase
 *     tags: [Purchases]
 *     parameters:
 *       - $ref: '#/components/parameters/purchaseId'
 *     responses:
 *       200:
 *         description: Purchase approved
 *       400:
 *         description: Only pending purchase can be approved
 *       404:
 *         description: Purchase not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases/{id}/receive:
 *   patch:
 *     summary: Receive purchase & update inventory
 *     tags: [Purchases]
 *     description: |
 *       - Only approved purchases can be received
 *       - Updates inventory batch automatically
 *     parameters:
 *       - $ref: '#/components/parameters/purchaseId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReceivePurchase'
 *     responses:
 *       200:
 *         description: Purchase received and inventory updated
 *       400:
 *         description: Validation error / invalid state
 *       404:
 *         description: Purchase or medicine not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases:
 *   get:
 *     summary: Get list of purchases
 *     tags: [Purchases]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/purchaseSearch'
 *       - $ref: '#/components/parameters/status'
 *       - $ref: '#/components/parameters/paymentStatus'
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: List of purchases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 total:
 *                   type: number
 *                 pending:
 *                   type: number
 *                 approved:
 *                   type: number
 *                 received:
 *                   type: number
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     count:
 *                       type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Purchase'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases/{id}:
 *   get:
 *     summary: Get single purchase info
 *     tags: [Purchases]
 *     parameters:
 *       - $ref: '#/components/parameters/purchaseId'
 *     responses:
 *       200:
 *         description: Purchase found
 *       404:
 *         description: Purchase not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases/{id}:
 *   delete:
 *     summary: Delete purchase
 *     tags: [Purchases]
 *     parameters:
 *       - $ref: '#/components/parameters/purchaseId'
 *     responses:
 *       200:
 *         description: Purchase deleted successfully
 *       404:
 *         description: Purchase not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
