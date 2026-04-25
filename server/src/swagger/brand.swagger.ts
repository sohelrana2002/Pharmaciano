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
 *       properties:
 *         _id:
 *           type: string
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

 *     CreateBrandUser:
 *       type: object
 *       required:
 *         - name
 *         - manufacturer
 *         - country
 *       properties:
 *         name:
 *           type: string
 *         manufacturer:
 *           type: string
 *         country:
 *           type: string
 *         isActive:
 *           type: boolean

 *     CreateBrandSuperAdmin:
 *       type: object
 *       required:
 *         - name
 *         - manufacturer
 *         - country
 *         - organizationName
 *       properties:
 *         name:
 *           type: string
 *         manufacturer:
 *           type: string
 *         country:
 *           type: string
 *         organizationName:
 *           type: string
 *         isActive:
 *           type: boolean

 *     UpdateBrand:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         manufacturer:
 *           type: string
 *         country:
 *           type: string
 *         isActive:
 *           type: boolean
 *         organizationName:
 *           type: string

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

 *     brandSearch:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search by brand name or manufacturer

 *     isActive:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: boolean
 *       description: Filter active/inactive brands
 */

/**
 * @swagger
 * /api/v1/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     description: |
 *       - Normal user: organization from token
 *       - Super Admin: must provide organizationName
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateBrandUser'
 *               - $ref: '#/components/schemas/CreateBrandSuperAdmin'
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Organization not found
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
 *       - $ref: '#/components/parameters/brandSearch'
 *       - $ref: '#/components/parameters/isActive'
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
 *                   type: number
 *                 active:
 *                   type: number
 *                 inActive:
 *                   type: number
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     count:
 *                       type: number
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
 *     summary: Get single brand info
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     responses:
 *       200:
 *         description: Brand found
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
 *   patch:
 *     summary: Update brand
 *     tags: [Brands]
 *     description: |
 *       - Normal user: organization from token
 *       - Super Admin: must provide organizationName
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBrand'
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       404:
 *         description: Brand not found
 *       409:
 *         description: Duplicate brand name
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   delete:
 *     summary: Delete brand
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
