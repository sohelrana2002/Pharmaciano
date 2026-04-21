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
 *         medicineName:
 *           type: string
 *           example: medicine name(napa 500mg) or barcode(MED-349A2BDP)
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
 *           example: INV-1001
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
 *           type: string
 *           enum: [cash, card, mobile]

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
 *             branchName:
 *               type: string

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
 *             $ref: '#/components/schemas/SaleItem'
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

 *     searchSale:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search sales by invoice number or customer name (e.g. INV-1001, rahim)
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
 *       - $ref: '#/components/parameters/searchSale'
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
 *     summary: Generate PDF invoice
 *     tags: [Sales]
 *     description: Generate PDF invoice for a sale
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
 *       404:
 *         description: Sale not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
