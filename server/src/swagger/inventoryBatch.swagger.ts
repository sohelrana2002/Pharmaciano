/**
 * @swagger
 * tags:
 *   name: InventoryBatch
 *   description: API endpoints for managing medicine inventory batches
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryBatch:
 *       type: object
 *       required:
 *         - orgName
 *         - branchName
 *         - medicineName
 *         - batchNo
 *         - expiryDate
 *         - quantity
 *         - purchasePrice
 *         - warehouseName
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f123abc1234567890abcd1"
 *         orgName:
 *           type: string
 *           example: "Square Pharmaceuticals"
 *         branchName:
 *           type: string
 *           example: "Dhaka Branch"
 *         medicineName:
 *           type: string
 *           example: "Napa"
 *         batchNo:
 *           type: string
 *           example: "NAPA-BATCH-2026-01"
 *         expiryDate:
 *           type: string
 *           format: date
 *           example: "2027-05-20"
 *         quantity:
 *           type: number
 *           example: 500
 *         purchasePrice:
 *           type: number
 *           example: 3.5
 *         warehouseName:
 *           type: string
 *           example: "Dhaka Main Warehouse"
 *         status:
 *           type: string
 *           enum: [active, expired]
 *           example: "active"
 *         organizationId:
 *           type: string
 *           example: "65f123abc1234567890abcd2"
 *         branchId:
 *           type: string
 *           example: "65f123abc1234567890abcd3"
 *         medicineId:
 *           type: string
 *           example: "65f123abc1234567890abcd4"
 *         warehouseId:
 *           type: string
 *           example: "65f123abc1234567890abcd5"
 *         createdBy:
 *           type: string
 *           example: "65f123abc1234567890abcd6"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * ============================================
 * CREATE INVENTORY BATCH
 * ============================================
 */

/**
 * @swagger
 * /api/v1/inventory-batches:
 *   post:
 *     summary: Create a new medicine inventory batch
 *     tags: [InventoryBatch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryBatch'
 *     responses:
 *       201:
 *         description: Inventory batch created successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Invalid organization, branch, medicine, or warehouse name
 *       409:
 *         description: Batch number already exists
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * LIST INVENTORY BATCHES
 * ============================================
 */

/**
 * @swagger
 * /api/v1/inventory-batches:
 *   get:
 *     summary: Get all inventory batches
 *     tags: [InventoryBatch]
 *     security:
 *       - bearerAuth: []
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
 *                 length:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     inventoryBatch:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/InventoryBatch'
 *       404:
 *         description: No inventory batch found
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * INVENTORY BATCH DETAILS
 * ============================================
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   get:
 *     summary: Get inventory batch information by ID
 *     tags: [InventoryBatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory batch MongoDB ID
 *     responses:
 *       200:
 *         description: Inventory batch retrieved successfully
 *       404:
 *         description: Inventory batch not found
 *       409:
 *         description: Invalid ID format
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * UPDATE INVENTORY BATCH
 * ============================================
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   put:
 *     summary: Update inventory batch by ID
 *     tags: [InventoryBatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory batch MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryBatch'
 *     responses:
 *       200:
 *         description: Inventory batch updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Inventory batch not found
 *       409:
 *         description: Duplicate batch number or invalid ID
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * DELETE INVENTORY BATCH
 * ============================================
 */

/**
 * @swagger
 * /api/v1/inventory-batches/{id}:
 *   delete:
 *     summary: Delete inventory batch by ID
 *     tags: [InventoryBatch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory batch MongoDB ID
 *     responses:
 *       200:
 *         description: Inventory batch deleted successfully
 *       404:
 *         description: Inventory batch not found
 *       409:
 *         description: Invalid ID format
 *       500:
 *         description: Server error
 */
