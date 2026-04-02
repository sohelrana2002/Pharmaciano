/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Category management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - isActive
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         name:
 *           type: string
 *         description:
 *           type: string
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
 *     categoryId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Category ID
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
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - isActive
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get list of categories
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/isActive'
 *       - $ref: '#/components/parameters/name'
 *     responses:
 *       200:
 *         description: List of categories
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
 *                     category:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get individual category info
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     responses:
 *       200:
 *         description: Category found
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
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
