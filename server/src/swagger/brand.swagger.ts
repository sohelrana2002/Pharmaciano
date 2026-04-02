/**
 * @swagger
 * tags:
 *   - name: Brands
 *     description: Brand management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       required:
 *         - name
 *         - manufacturer
 *         - country
 *         - isActive
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         name:
 *           type: string
 *         manufacturer:
 *           type: string
 *         country:
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
 *     brandId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Brand ID
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
 * /api/v1/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - manufacturer
 *               - country
 *               - isActive
 *             properties:
 *               name:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               country:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Brand already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Get list of brands
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/isActive'
 *       - $ref: '#/components/parameters/name'
 *     responses:
 *       200:
 *         description: List of brands
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     brands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Get individual brand info
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     responses:
 *       200:
 *         description: Brand found
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
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   put:
 *     summary: Update a brand
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               country:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       404:
 *         description: Brand not found
 *       409:
 *         description: Brand name already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   delete:
 *     summary: Delete a brand
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
