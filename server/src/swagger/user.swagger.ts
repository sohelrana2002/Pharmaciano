/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1c9b1c2a1e3a4b5c6d777
 *         email:
 *           type: string
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: John Doe
 *         role:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: ADMIN
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *         organization:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             address:
 *               type: string
 *         branch:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             address:
 *               type: string
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *               - orgName
 *               - branchName
 *               - isActive
 *               - phone
 *               - warehouseName
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *               name:
 *                 type: string
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 example: ADMIN
 *               orgName:
 *                 type: string
 *                 example: Pharmaciano Ltd
 *               branchName:
 *                 type: string
 *                 example: Dhaka Branch
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               phone:
 *                 type: string
 *                 example: 01751070860
 *               warehouseName:
 *                 type: string
 *                 example: Central warehouse
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *       400:
 *         description: Validation failed or invalid role
 *       404:
 *         description: Invalid organization or branch name
 *       409:
 *         description: User email already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get list of all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
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
 *                     profile:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: MANAGER
 *               orgName:
 *                 type: string
 *               branchName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User updated successfully
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *       400:
 *         description: Validation failed or invalid ID
 *       404:
 *         description: User not found or invalid organization/branch
 *       409:
 *         description: User email already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
