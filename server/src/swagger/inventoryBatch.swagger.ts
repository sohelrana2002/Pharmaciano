/**
 * @swagger
 * tags:
 *   - name: Inventory Batches
 *     description: Inventory batch management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryBatch:
 *       type: object
 *       required:
 *         - batchNo
 *         - expiryDate
 *         - quantity
 *         - purchasePrice
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         organizationId:
 *           type: string
 *         branchId:
 *           type: string
 *         warehouseId:
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

 *     CreateInventoryBatchUser:
 *       type: object
 *       required:
 *         - medicineName
 *         - batchNo
 *         - expiryDate
 *         - quantity
 *         - purchasePrice
 *       properties:
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
 *         warehouseName:
 *           type: string

 *     CreateInventoryBatchSuperAdmin:
 *       type: object
 *       required:
 *         - medicineName
 *         - batchNo
 *         - expiryDate
 *         - quantity
 *         - purchasePrice
 *         - organizationName
 *         - branchName
 *       properties:
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
 *         warehouseName:
 *           type: string
 *         organizationName:
 *           type: string
 *           description: Required only for Super Admin
 *         branchName:
 *           type: string
 *           description: Required only for Super Admin

 *     UpdateInventoryBatchUser:
 *       type: object
 *       properties:
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
 *         warehouseName:
 *           type: string

 *     UpdateInventoryBatchSuperAdmin:
 *       type: object
 *       properties:
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
 *         warehouseName:
 *           type: string
 *         organizationName:
 *           type: string
 *           description: Only for Super Admin
 *         branchName:
 *           type: string
 *           description: Only for Super Admin

 *   parameters:
 *     inventoryBatchId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Inventory Batch ID
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
 *     tags: [Inventory Batches]
 *     description: |
 *       - Normal users: organization & branch come from token
 *       - Super Admin: must provide organizationName & branchName
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateInventoryBatchUser'
 *               - $ref: '#/components/schemas/CreateInventoryBatchSuperAdmin'
 *     responses:
 *       201:
 *         description: Inventory batch created successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Organization / Branch / Medicine / Warehouse not found
 *       409:
 *         description: Batch already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/inventory-batches:
 *   get:
 *     summary: Get list of inventory batches
 *     tags: [Inventory Batches]
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
 *                 total:
 *                   type: integer
 *                 active:
 *                   type: integer
 *                 expired:
 *                   type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     count:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryBatch'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   get:
 *     summary: Get individual inventory batch info
 *     tags: [Inventory Batches]
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
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   put:
 *     summary: Update an inventory batch
 *     tags: [Inventory Batches]
 *     description: |
 *       - Normal users: cannot change organization/branch
 *       - Super Admin: can update organizationName & branchName
 *     parameters:
 *       - $ref: '#/components/parameters/inventoryBatchId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateInventoryBatchUser'
 *               - $ref: '#/components/schemas/UpdateInventoryBatchSuperAdmin'
 *     responses:
 *       200:
 *         description: Inventory batch updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       404:
 *         description: Not found
 *       409:
 *         description: Batch already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   delete:
 *     summary: Delete an inventory batch
 *     tags: [Inventory Batches]
 *     parameters:
 *       - $ref: '#/components/parameters/inventoryBatchId'
 *     responses:
 *       200:
 *         description: Inventory batch deleted successfully
 *       404:
 *         description: Not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
