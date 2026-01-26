/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: API endpoints for managing branches
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         organization:
 *           type: string
 *         createdBy:
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
 *         orgName:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
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
 *               - orgName
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
 *               orgName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Invalid organization name
 *       409:
 *         description: Branch name already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: Get list of all active branches
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     branch:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Get individual branch info
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *       409:
 *         description: Invalid branch ID
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   put:
 *     summary: Update an existing branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
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
 *               orgName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Branch not found or invalid organization name
 *       409:
 *         description: Branch name already exists or invalid ID
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 *       409:
 *         description: Invalid branch ID
 *       500:
 *         description: Internal server error
 */
