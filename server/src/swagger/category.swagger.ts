/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           example: 65b8f1a2c9e77a0012abc123
 *         name:
 *           type: string
 *           example: Pain Killer
 *         description:
 *           type: string
 *           example: Medicines used to relieve pain
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdBy:
 *           type: string
 *           example: 65a7e91f9b1c220012de456
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: API endpoints for managing categories
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new category. Only authenticated users can create categories.
 *     tags: [Category]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Antibiotics
 *               description:
 *                 type: string
 *                 example: Medicines used to treat bacterial infections
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Category created successfully!
 *                 id:
 *                   type: string
 *       409:
 *         description: Category already exists
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all active categories
 *     description: Retrieve a list of all active categories.
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Category list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 length:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category details
 *     description: Retrieve individual category information by category ID.
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Individual category info!
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Update category name or description by ID.
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vitamins
 *               description:
 *                 type: string
 *                 example: Supplements for daily health
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Category not found
 *       409:
 *         description: Duplicate category name
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Permanently delete a category by ID.
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Invalid category ID
 *       500:
 *         description: Internal server error
 */
