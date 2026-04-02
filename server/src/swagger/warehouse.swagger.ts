/**
 * @swagger
 * tags:
 *   - name: Warehouses
 *     description: Warehouse management APIs
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
 *         - isActive
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         name:
 *           type: string
 *         location:
 *           type: string
 *         capacity:
 *           type: number
 *         isActive:
 *           type: boolean
 *         organizationId:
 *           type: string
 *         branchId:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time

 *   parameters:
 *     warehouseId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Warehouse ID
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
 *     isActive:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: boolean
 *     name:
 *       in: query
 *       name: name
 *       schema:
 *         type: string
 */

/**
 * @swagger
 * /api/v1/warehouses:
 *   post:
 *     summary: Create a new warehouse
 *     tags: [Warehouses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - capacity
 *               - branchName
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: number
 *               branchName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Warehouse already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/warehouses:
 *   get:
 *     summary: Get list of warehouses
 *     tags: [Warehouses]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/isActive'
 *       - $ref: '#/components/parameters/name'
 *     responses:
 *       200:
 *         description: List of warehouses
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
 *                 inActive:
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
 *                   type: object
 *                   properties:
 *                     warehouse:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Warehouse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   get:
 *     summary: Get individual warehouse info
 *     tags: [Warehouses]
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseId'
 *     responses:
 *       200:
 *         description: Warehouse found
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
 *                     warehouse:
 *                       $ref: '#/components/schemas/Warehouse'
 *       404:
 *         description: Warehouse not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   put:
 *     summary: Update a warehouse
 *     tags: [Warehouses]
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: number
 *               branchName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       404:
 *         description: Warehouse not found
 *       409:
 *         description: Warehouse name already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/warehouses/{id}:
 *   delete:
 *     summary: Delete a warehouse
 *     tags: [Warehouses]
 *     parameters:
 *       - $ref: '#/components/parameters/warehouseId'
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
 *       404:
 *         description: Warehouse not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
