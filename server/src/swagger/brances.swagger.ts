/**
 * @swagger
 * tags:
 *   - name: Branches
 *     description: Branch management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - contact
 *         - isActive
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *         isActive:
 *           type: boolean
 *         organizationId:
 *           type: string
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
 *     branchId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Branch ID
 *
 *     page:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *         example: 1
 *
 *     limit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 10
 *         example: 10
 *
 *     name:
 *       in: query
 *       name: name
 *       schema:
 *         type: string
 *
 *     isActive:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: boolean
 */

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Create a branch
 *     tags: [Branches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - contact
 *               - isActive
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Branch already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: Get list of branches
 *     tags: [Branches]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/name'
 *       - $ref: '#/components/parameters/isActive'
 *     responses:
 *       200:
 *         description: List of branches
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
 *                 inActive:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     branch:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Branch'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches]
 *     parameters:
 *       - $ref: '#/components/parameters/branchId'
 *     responses:
 *       200:
 *         description: Branch found
 *       404:
 *         description: Branch not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   put:
 *     summary: Update branch
 *     tags: [Branches]
 *     parameters:
 *       - $ref: '#/components/parameters/branchId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Branch not found
 *       409:
 *         description: Duplicate or invalid
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   delete:
 *     summary: Delete branch
 *     tags: [Branches]
 *     parameters:
 *       - $ref: '#/components/parameters/branchId'
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
