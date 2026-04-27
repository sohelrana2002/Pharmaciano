/**
 * @swagger
 * tags:
 *   - name: Accounts (Chart of Accounts)
 *     description: Manage financial accounts including assets, liabilities, income, expenses, and equity
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [asset, liability, income, expense, equity]
 *         code:
 *           type: string
 *         parentId:
 *           type: string
 *         organizationId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time

 *     CreateAccountUser:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - code
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [asset, liability, income, expense, equity]
 *         code:
 *           type: string
 *         isActive:
 *           type: boolean

 *     CreateAccountSuperAdmin:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - code
 *         - organizationName
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [asset, liability, income, expense, equity]
 *         code:
 *           type: string
 *         organizationName:
 *           type: string
 *         isActive:
 *           type: boolean

 *     UpdateAccount:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [asset, liability, income, expense, equity]
 *         code:
 *           type: string
 *         organizationName:
 *           type: string
 *         isActive:
 *           type: boolean

 *   parameters:
 *     accountId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Account ID

 *     accountSearch:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search by account name

 *     accountType:
 *       in: query
 *       name: type
 *       schema:
 *         type: string
 *         enum: [asset, liability, income, expense, equity]

 *     isActive:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: boolean

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
 */

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts (Chart of Accounts)]
 *     description: |
 *       - Normal users: organization from token
 *       - Super Admin: must provide organizationName
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateAccountUser'
 *               - $ref: '#/components/schemas/CreateAccountSuperAdmin'
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Organization not found
 *       409:
 *         description: Duplicate account name/code
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/accounts:
 *   get:
 *     summary: Get list of accounts
 *     tags: [Accounts (Chart of Accounts)]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/accountSearch'
 *       - $ref: '#/components/parameters/accountType'
 *       - $ref: '#/components/parameters/isActive'
 *     responses:
 *       200:
 *         description: List of accounts
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
 *                     accounts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Account'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/accounts/{id}:
 *   get:
 *     summary: Get single account info
 *     tags: [Accounts (Chart of Accounts)]
 *     parameters:
 *       - $ref: '#/components/parameters/accountId'
 *     responses:
 *       200:
 *         description: Account found
 *       404:
 *         description: Account not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/accounts/{id}:
 *   patch:
 *     summary: Update account
 *     tags: [Accounts (Chart of Accounts)]
 *     parameters:
 *       - $ref: '#/components/parameters/accountId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAccount'
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Account or organization not found
 *       409:
 *         description: Duplicate account
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/accounts/{id}:
 *   delete:
 *     summary: Delete account
 *     tags: [Accounts (Chart of Accounts)]
 *     parameters:
 *       - $ref: '#/components/parameters/accountId'
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       404:
 *         description: Account not found
 *       409:
 *         description: Invalid ID
 *       500:
 *         description: Server error
 */
