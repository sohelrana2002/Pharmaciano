/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: API endpoints for managing roles and permissions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d999
 *         name:
 *           type: string
 *           example: ADMIN
 *         description:
 *           type: string
 *           example: Administrator role with full access
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["user:create", "user:read", "user:update", "inventory:manage", "organization:manage"]
 *         createdBy:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d123
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Feature:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: BRAND_CREATE
 *         category:
 *           type: string
 *           example: BRAND
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
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
 *               - description
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 example: MANAGER
 *               description:
 *                 type: string
 *                 example: Manager role with limited permissions
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user:create", "user:read", "user:update", "inventory:manage", "organization:manage"]
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                     role:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Validation failed or invalid permissions
 *       409:
 *         description: Role name already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get list of all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Update an existing role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: ADMIN_UPDATED
 *               description:
 *                 type: string
 *                 example: Updated admin role
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user:create", "user:read", "user:delete", "inventory:manage", "organization:manage"]
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Validation failed or invalid role ID
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Invalid role ID
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/roles/features:
 *   get:
 *     summary: Get list of all active features
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of features
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     features:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Feature'
 *       500:
 *         description: Internal server error
 */
