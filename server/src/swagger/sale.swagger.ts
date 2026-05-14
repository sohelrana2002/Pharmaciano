/**
 * @swagger
 * tags:
 *   - name: Sales
 *     description: Sales management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SaleItem:
 *       type: object
 *       required:
 *         - medicineName
 *         - batchNo
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
 *         quantity:
 *           type: number
 *           example: 5
 *         sellingPrice:
 *           type: number
 *           example: 12
 *         purchasePrice:
 *           type: number
 *           example: 8
 *
 *     PaymentMethod:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [cash, card, mobile]
 *           example: mobile
 *         provider:
 *           type: string
 *           enum: [bkash, nagad, rocket]
 *           example: bkash
 *
 *     Sale:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6851b18fcb234fa92f45f111
 *         organizationId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f112
 *         branchId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f113
 *         cashierId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f114
 *         invoiceNo:
 *           type: string
 *           example: INV-1001
 *         customerName:
 *           type: string
 *           example: Rahim
 *         customerPhone:
 *           type: string
 *           example: 017XXXXXXXX
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         subtotal:
 *           type: number
 *           example: 500
 *         discount:
 *           type: number
 *           example: 5
 *         tax:
 *           type: number
 *           example: 10
 *         totalAmount:
 *           type: number
 *           example: 525
 *         paymentMethod:
 *           $ref: '#/components/schemas/PaymentMethod'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateSaleUser:
 *       type: object
 *       required:
 *         - customerName
 *         - customerPhone
 *         - items
 *         - paymentMethod
 *       properties:
 *         customerName:
 *           type: string
 *           example: Rahim
 *         customerPhone:
 *           type: string
 *           example: 017XXXXXXXX
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         discount:
 *           type: number
 *           example: 5
 *         tax:
 *           type: number
 *           example: 10
 *         paymentMethod:
 *           $ref: '#/components/schemas/PaymentMethod'
 *
 *     CreateSaleSuperAdmin:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateSaleUser'
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
 *     UpdateSale:
 *       type: object
 *       properties:
 *         customerName:
 *           type: string
 *           example: Karim
 *         customerPhone:
 *           type: string
 *           example: 018XXXXXXXX
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         discount:
 *           type: number
 *           example: 3
 *         tax:
 *           type: number
 *           example: 5
 *         paymentMethod:
 *           $ref: '#/components/schemas/PaymentMethod'
 *         organizationName:
 *           type: string
 *           example: MediCare Pharmacy
 *         branchName:
 *           type: string
 *           example: Uttara Branch
 *
 *   parameters:
 *     saleId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Sale ID
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
 *     searchSale:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search by invoice number or customer name
 *
 *     fromDate:
 *       in: query
 *       name: fromDate
 *       schema:
 *         type: string
 *         format: date
 *       example: 2026-05-01
 *
 *     toDate:
 *       in: query
 *       name: toDate
 *       schema:
 *         type: string
 *         format: date
 *       example: 2026-05-31
 */

/**
 * @swagger
 * /api/v1/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     description: |
 *       Create sale with stock deduction and journal entry.
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
 *               - $ref: '#/components/schemas/CreateSaleUser'
 *               - $ref: '#/components/schemas/CreateSaleSuperAdmin'
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sale created successfully
 *                 id:
 *                   type: string
 *                 invoiceNo:
 *                   type: string
 *                   example: INV-1001
 *
 *       400:
 *         description: Validation failed or insufficient stock
 *
 *       404:
 *         description: Organization / Branch / Medicine / Batch not found
 *
 *       409:
 *         description: Duplicate data conflict
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/searchSale'
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Sales fetched successfully
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
 *                 active:
 *                   type: number
 *                 expired:
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
 *                     sales:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sale'
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   get:
 *     summary: Get single sale details
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     responses:
 *       200:
 *         description: Sale found successfully
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
 *                     sale:
 *                       $ref: '#/components/schemas/Sale'
 *
 *       404:
 *         description: Sale not found
 *
 *       409:
 *         description: Invalid sale ID
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   put:
 *     summary: Update sale
 *     tags: [Sales]
 *     description: |
 *       Update sale with stock rollback and journal reverse entry.
 *
 *       - Normal User:
 *         cannot update organization or branch
 *
 *       - Super Admin:
 *         can update organizationName & branchName
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSale'
 *     responses:
 *       200:
 *         description: Sale updated successfully
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
 *
 *       400:
 *         description: Validation failed / insufficient stock
 *
 *       404:
 *         description: Sale / Medicine / Batch / Account not found
 *
 *       409:
 *         description: Invalid ID or duplicate conflict
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   delete:
 *     summary: Delete sale
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     responses:
 *       200:
 *         description: Sale deleted successfully
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
 *
 *       404:
 *         description: Sale not found
 *
 *       409:
 *         description: Invalid sale ID
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}/invoice:
 *   get:
 *     summary: Generate sale invoice PDF
 *     tags: [Sales]
 *     description: Generate and download PDF invoice for a sale
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *
 *       404:
 *         description: Sale not found
 *
 *       409:
 *         description: Invalid sale ID
 *
 *       500:
 *         description: Server error
 */
