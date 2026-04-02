/**
 * @swagger
 * tags:
 *   - name: InventoryBatches
 *     description: Inventory batch management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryBatch:
 *       type: object
 *       required:
 *         - medicineName
 *         - batchNo
 *         - expiryDate
 *         - quantity
 *         - purchasePrice
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         medicineName:
 *           type: string
 *         medicineId:
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
 *         warehouseId:
 *           type: string
 *         branchId:
 *           type: string
 *         organizationId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, expired]
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   parameters:
 *     inventoryBatchId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Inventory batch ID
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
 *     status:
 *       in: query
 *       name: status
 *       schema:
 *         type: string
 *         enum: [active, expired]
 *     medicineName:
 *       in: query
 *       name: medicineName
 *       schema:
 *         type: string
 *     batchNo:
 *       in: query
 *       name: batchNo
 *       schema:
 *         type: string
 */

/**
 * @swagger
 * /api/v1/inventory-batches:
 *   post:
 *     summary: Create a new inventory batch
 *     tags: [InventoryBatches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicineName
 *               - batchNo
 *               - expiryDate
 *               - quantity
 *               - purchasePrice
 *             properties:
 *               medicineName:
 *                 type: string
 *               batchNo:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               purchasePrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Inventory batch created successfully
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
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Invalid medicine name
 *       409:
 *         description: Batch number already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/inventory-batches:
 *   get:
 *     summary: List all inventory batches
 *     tags: [InventoryBatches]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/status'
 *       - $ref: '#/components/parameters/medicineName'
 *       - $ref: '#/components/parameters/batchNo'
 *     responses:
 *       200:
 *         description: List of inventory batches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     count:
 *                       type: integer
 *                 total:
 *                   type: integer
 *                 active:
 *                   type: integer
 *                 expired:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryBatch'
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   get:
 *     summary: Get individual inventory batch info
 *     tags: [InventoryBatches]
 *     parameters:
 *       - $ref: '#/components/parameters/inventoryBatchId'
 *     responses:
 *       200:
 *         description: Inventory batch found
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
 *                     inventoryBatch:
 *                       $ref: '#/components/schemas/InventoryBatch'
 *       404:
 *         description: Inventory batch not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   put:
 *     summary: Update inventory batch
 *     tags: [InventoryBatches]
 *     parameters:
 *       - $ref: '#/components/parameters/inventoryBatchId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicineName:
 *                 type: string
 *               batchNo:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               purchasePrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Inventory batch updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Inventory batch not found
 *       409:
 *         description: Batch number already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   delete:
 *     summary: Delete inventory batch
 *     tags: [InventoryBatches]
 *     parameters:
 *       - $ref: '#/components/parameters/inventoryBatchId'
 *     responses:
 *       200:
 *         description: Inventory batch deleted successfully
 *       404:
 *         description: Inventory batch not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
