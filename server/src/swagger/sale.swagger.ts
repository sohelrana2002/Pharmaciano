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
 *       properties:
 *         medicineId:
 *           type: string
 *         medicineName:
 *           type: string
 *         batchNo:
 *           type: string
 *         quantity:
 *           type: number
 *         sellingPrice:
 *           type: number
 *         purchasePrice:
 *           type: number

 *     Sale:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         organizationId:
 *           type: string
 *         branchId:
 *           type: string
 *         cashierId:
 *           type: string
 *         invoiceNo:
 *           type: string
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         subtotal:
 *           type: number
 *         discount:
 *           type: number
 *         tax:
 *           type: number
 *         totalAmount:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, mobile]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time

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
 *         customerPhone:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - medicineName
 *               - batchNo
 *               - quantity
 *             properties:
 *               medicineName:
 *                 type: string
 *               batchNo:
 *                 type: string
 *               quantity:
 *                 type: number
 *         discount:
 *           type: number
 *         tax:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, mobile]

 *     CreateSaleSuperAdmin:
 *       type: object
 *       required:
 *         - customerName
 *         - customerPhone
 *         - items
 *         - paymentMethod
 *         - organizationName
 *         - branchName
 *       properties:
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               medicineName:
 *                 type: string
 *               batchNo:
 *                 type: string
 *               quantity:
 *                 type: number
 *         discount:
 *           type: number
 *         tax:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, mobile]
 *         organizationName:
 *           type: string
 *         branchName:
 *           type: string

 *     UpdateSale:
 *       type: object
 *       properties:
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               medicineName:
 *                 type: string
 *               batchNo:
 *                 type: string
 *               quantity:
 *                 type: number
 *         discount:
 *           type: number
 *         tax:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, mobile]
 *         organizationName:
 *           type: string
 *         branchName:
 *           type: string

 *   parameters:
 *     saleId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Sale ID
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
 *     search:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search sales by invoice number or customer name
 */

/**
 * @swagger
 * /api/v1/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     description: |
 *       - Normal users: organization & branch from token
 *       - Super Admin: must provide organizationName & branchName
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
 *       400:
 *         description: Validation failed / stock issue
 *       404:
 *         description: Medicine / Batch / Organization / Branch not found
 *       409:
 *         description: Duplicate invoice
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales:
 *   get:
 *     summary: Get list of sales
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of sales
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
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}:
 *   get:
 *     summary: Get single sale info
 *     tags: [Sales]
 *     parameters:
 *       - $ref: '#/components/parameters/saleId'
 *     responses:
 *       200:
 *         description: Sale found
 *       404:
 *         description: Sale not found
 *       409:
 *         description: Invalid ID
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
 *       - Normal users: cannot change organization/branch
 *       - Super Admin: can update organizationName & branchName
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
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Not found
 *       409:
 *         description: Duplicate data
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
 *       404:
 *         description: Sale not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/sales/{id}/invoice:
 *   get:
 *     summary: Generate PDF invoice for a specific sale
 *     description: Generates a PDF invoice for a sale by its ID, including organization, branch, cashier, warehouse, and medicine details.
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the sale to generate the PDF for
 *         schema:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d999
 *     responses:
 *       200:
 *         description: PDF invoice generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Sale not found
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
 *                   example: Sale with ID 64f1c9b1c2a1e3a4b5c6d999 not found
 *       409:
 *         description: Invalid sale ID format
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
 *                   example: "Invalid Mongoose ID: abc123"
 *       500:
 *         description: Server error while generating PDF
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
 *                   example: Internal server error
 */
