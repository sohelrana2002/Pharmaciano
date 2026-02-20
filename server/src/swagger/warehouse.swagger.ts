/**
 * ============================================
 * WAREHOUSE SCHEMA
 * ============================================
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Warehouse:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - capacity
 *         - branchName
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f123abc1234567890abcd1"
 *         name:
 *           type: string
 *           example: "Dhaka Main Warehouse"
 *         location:
 *           type: string
 *           example: "Dhaka, Bangladesh"
 *         capacity:
 *           type: number
 *           example: 5000
 *         branchName:
 *           type: string
 *           example: "Dhaka Branch"
 *         isActive:
 *           type: boolean
 *           example: true
 *         branchId:
 *           type: string
 *           example: "65f123abc1234567890abcd2"
 *         createdBy:
 *           type: string
 *           example: "65f123abc1234567890abcd3"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * ============================================
 * CREATE WAREHOUSE
 * ============================================
 */

/**
 * @swagger
 * /api/v1/warehouses:
 *   post:
 *     summary: Create a new warehouse
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Warehouse'
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Invalid branch name
 *       409:
 *         description: Warehouse already exists
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * LIST ACTIVE WAREHOUSES
 * ============================================
 */

/**
 * @swagger
 * /api/v1/warehouses:
 *   get:
 *     summary: Get all active warehouses
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active warehouses
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
 *                     warehouse:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Warehouse'
 *       404:
 *         description: No warehouse found
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * WAREHOUSE DETAILS
 * ============================================
 */

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   get:
 *     summary: Get warehouse information by ID
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse MongoDB ID
 *     responses:
 *       200:
 *         description: Warehouse details retrieved successfully
 *       404:
 *         description: Warehouse not found
 *       409:
 *         description: Invalid ID format
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * UPDATE WAREHOUSE
 * ============================================
 */

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   put:
 *     summary: Update warehouse by ID
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Warehouse'
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Warehouse not found
 *       409:
 *         description: Duplicate warehouse name or invalid ID
 *       500:
 *         description: Server error
 */

/**
 * ============================================
 * DELETE WAREHOUSE
 * ============================================
 */

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   delete:
 *     summary: Delete warehouse by ID
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse MongoDB ID
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
 *       404:
 *         description: Warehouse not found
 *       409:
 *         description: Invalid ID format
 *       500:
 *         description: Server error
 */
