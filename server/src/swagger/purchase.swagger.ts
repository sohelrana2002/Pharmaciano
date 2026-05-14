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
 *       required:
 *         - medicineName
 *         - quantity
 *       properties:
 *         medicineId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f111
 *         medicineName:
 *           type: string
 *           example: Napa 500mg
 *         batchNo:
 *           type: string
 *           example: BATCH-1001
 *         expiryDate:
 *           type: string
 *           format: date
 *           example: 2027-12-31
 *         quantity:
 *           type: number
 *           example: 50
 *         purchasePrice:
 *           type: number
 *           example: 8
 *         totalCost:
 *           type: number
 *           example: 400
 *
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
 *           example: PUR-1747202121
 *         status:
 *           type: string
 *           enum: [pending, approved, received]
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchaseItem'
 *         subtotal:
 *           type: number
 *           example: 1000
 *         discount:
 *           type: number
 *           example: 5
 *         tax:
 *           type: number
 *           example: 10
 *         totalAmount:
 *           type: number
 *           example: 1050
 *         approvedBy:
 *           type: string
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, partial, paid]
 *         paidAmount:
 *           type: number
 *           example: 500
 *         dueAmount:
 *           type: number
 *           example: 550
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreatePurchaseUser:
 *       type: object
 *       required:
 *         - supplier
 *         - items
 *         - paymentStatus
 *         - paidAmount
 *       properties:
 *         supplier:
 *           type: string
 *           example: Square Pharmaceuticals
 *         warehouseName:
 *           type: string
 *           example: Main Warehouse
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, partial, paid]
 *         paidAmount:
 *           type: number
 *           example: 500
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
 *                 example: Napa 500mg
 *               quantity:
 *                 type: number
 *                 example: 50
 *
 *     CreatePurchaseSuperAdmin:
 *       allOf:
 *         - $ref: '#/components/schemas/CreatePurchaseUser'
 *         - type: object
 *           required:
 *             - organizationName
 *             - branchName
 *           properties:
 *             organizationName:
 *               type: string
 *               example: MediCare Pharmacy
 *             branchName:
 *               type: string
 *               example: Dhaka Branch
 *
 *     ReceivePurchase:
 *       type: object
 *       required:
 *         - items
 *         - paymentStatus
 *         - paidAmount
 *       properties:
 *         paymentStatus:
 *           type: string
 *           enum: [unpaid, partial, paid]
 *         paidAmount:
 *           type: number
 *           example: 1000
 *         discount:
 *           type: number
 *           example: 5
 *         tax:
 *           type: number
 *           example: 10
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - medicineName
 *               - batchNo
 *               - expiryDate
 *               - purchasePrice
 *             properties:
 *               medicineName:
 *                 type: string
 *                 example: Napa 500mg
 *               batchNo:
 *                 type: string
 *                 example: BATCH-1001
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: 2027-12-31
 *               purchasePrice:
 *                 type: number
 *                 example: 8
 *
 *     SupplierPayment:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           example: 500
 *
 *   parameters:
 *     purchaseId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Purchase ID
 *
 *     page:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *
 *     limit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 10
 *
 *     searchPurchase:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search purchase by purchase number
 *
 *     status:
 *       in: query
 *       name: status
 *       schema:
 *         type: string
 *         enum: [pending, approved, received]
 *
 *     paymentStatus:
 *       in: query
 *       name: paymentStatus
 *       schema:
 *         type: string
 *         enum: [unpaid, partial, paid]
 *
 *     fromDate:
 *       in: query
 *       name: fromDate
 *       schema:
 *         type: string
 *         format: date
 *
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
 *     summary: Create a purchase
 *     tags: [Purchases]
 *     description: |
 *       Create purchase request.
 *
 *       - Normal User:
 *         organization & branch come from token
 *
 *       - Super Admin:
 *         must provide organizationName & branchName
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 purchaseNo:
 *                   type: string
 *
 *       404:
 *         description: Medicine / Supplier / Organization / Branch / Warehouse not found
 *
 *       409:
 *         description: Duplicate data conflict
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases/{id}/approve:
 *   patch:
 *     summary: Approve purchase
 *     tags: [Purchases]
 *     description: Only pending purchases can be approved
 *     parameters:
 *       - $ref: '#/components/parameters/purchaseId'
 *     responses:
 *       200:
 *         description: Purchase approved successfully
 *
 *       400:
 *         description: Purchase already approved or received
 *
 *       404:
 *         description: Purchase not found
 *
 *       409:
 *         description: Invalid purchase ID
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases/{id}/receive:
 *   patch:
 *     summary: Receive purchase and update inventory batch
 *     tags: [Purchases]
 *     description: |
 *       Receive approved purchase.
 *       This API:
 *       - updates inventory batch
 *       - calculates subtotal, tax, discount
 *       - creates journal entries
 *       - updates payment & due amount
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
 *         description: Purchase received successfully
 *
 *       400:
 *         description: Validation failed or invalid purchase status
 *
 *       404:
 *         description: Purchase / Medicine / Account not found
 *
 *       409:
 *         description: Invalid purchase ID
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases:
 *   get:
 *     summary: Get purchase list
 *     tags: [Purchases]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/searchPurchase'
 *       - $ref: '#/components/parameters/status'
 *       - $ref: '#/components/parameters/paymentStatus'
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Purchase list fetched successfully
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
 *
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
 *         description: Purchase found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase:
 *                       $ref: '#/components/schemas/Purchase'
 *
 *       404:
 *         description: Purchase not found
 *
 *       409:
 *         description: Invalid purchase ID
 *
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
 *
 *       404:
 *         description: Purchase not found
 *
 *       409:
 *         description: Invalid purchase ID
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/purchases/{id}/pay-supplier:
 *   post:
 *     summary: Pay supplier due amount
 *     tags: [Purchases]
 *     description: |
 *       Pay due amount to supplier.
 *
 *       This API:
 *       - creates payable journal entry
 *       - updates paidAmount
 *       - updates dueAmount
 *       - updates paymentStatus
 *     parameters:
 *       - $ref: '#/components/parameters/purchaseId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierPayment'
 *     responses:
 *       200:
 *         description: Supplier payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchaseId:
 *                       type: string
 *                     paidAmount:
 *                       type: number
 *                     dueAmount:
 *                       type: number
 *
 *       400:
 *         description: Payment already clear or exceeds due amount
 *
 *       404:
 *         description: Purchase or account not found
 *
 *       409:
 *         description: Invalid purchase ID
 *
 *       500:
 *         description: Server error
 */
