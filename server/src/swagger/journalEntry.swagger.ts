/**
 * @swagger
 * tags:
 *   - name: Journal Entries
 *     description: Accounting journal entry management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JournalEntry:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6851b18fcb234fa92f45f111
 *         organizationId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f112
 *         branchId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f113
 *         debitAccountId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f114
 *         creditAccountId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f115
 *         amount:
 *           type: number
 *           example: 5000
 *         referenceType:
 *           type: string
 *           enum:
 *             - Sale
 *             - Purchase
 *             - Expense
 *             - Drawing
 *             - Capital
 *             - Manual
 *           example: Sale
 *         referenceId:
 *           type: string
 *           nullable: true
 *           example: 6851b18fcb234fa92f45f116
 *         note:
 *           type: string
 *           example: Sale invoice payment
 *         isReversed:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateJournalEntry:
 *       type: object
 *       required:
 *         - debitAccountId
 *         - creditAccountId
 *         - amount
 *         - referenceType
 *       properties:
 *         debitAccountId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f114
 *         creditAccountId:
 *           type: string
 *           example: 6851b18fcb234fa92f45f115
 *         amount:
 *           type: number
 *           example: 5000
 *         referenceType:
 *           type: string
 *           enum:
 *             - Sale
 *             - Purchase
 *             - Expense
 *             - Drawing
 *             - Capital
 *             - Manual
 *           example: Manual
 *         referenceId:
 *           type: string
 *           nullable: true
 *           example: 6851b18fcb234fa92f45f116
 *         note:
 *           type: string
 *           example: Manual cash adjustment
 *         organizationName:
 *           type: string
 *           example: MediCare Pharmacy
 *         branchName:
 *           type: string
 *           example: Dhaka Branch
 *
 *   parameters:
 *     journalEntryId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Journal Entry ID
 *
 *     page:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *
 *     journalLimit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 20
 *
 *     referenceType:
 *       in: query
 *       name: referenceType
 *       schema:
 *         type: string
 *         enum:
 *           - Sale
 *           - Purchase
 *           - Expense
 *           - Drawing
 *           - Capital
 *           - Manual
 *
 *     isReversed:
 *       in: query
 *       name: isReversed
 *       schema:
 *         type: boolean
 *
 *     fromDate:
 *       in: query
 *       name: fromDate
 *       schema:
 *         type: string
 *         format: date
 *       example: 2026-05-01
 *
 *     toDate:
 *       in: query
 *       name: toDate
 *       schema:
 *         type: string
 *         format: date
 *       example: 2026-05-31
 */

/**
 * @swagger
 * /api/v1/journal-entries:
 *   post:
 *     summary: Create journal entry
 *     tags: [Journal Entries]
 *     description: |
 *       Create manual accounting journal entry.
 *
 *       Rules:
 *       - Debit and Credit account cannot be same
 *       - Super Admin can provide organizationName & branchName
 *       - Normal users use organization & branch from token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJournalEntry'
 *     responses:
 *       201:
 *         description: Journal entry created successfully
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
 *                   example: Journal entry created successfully
 *                 id:
 *                   type: string
 *
 *       400:
 *         description: Invalid accounts or same debit/credit account
 *
 *       404:
 *         description: Organization or Branch not found
 *
 *       409:
 *         description: Duplicate data conflict
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/journal-entries:
 *   get:
 *     summary: Get journal entry list
 *     tags: [Journal Entries]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/journalLimit'
 *       - $ref: '#/components/parameters/referenceType'
 *       - $ref: '#/components/parameters/isReversed'
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Journal entry list fetched successfully
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
 *                 totalReversals:
 *                   type: number
 *                 totalUnreversals:
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
 *                     journal:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JournalEntry'
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/journal-entries/{id}:
 *   get:
 *     summary: Get single journal entry info
 *     tags: [Journal Entries]
 *     parameters:
 *       - $ref: '#/components/parameters/journalEntryId'
 *     responses:
 *       200:
 *         description: Journal entry found successfully
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
 *                     journal:
 *                       $ref: '#/components/schemas/JournalEntry'
 *
 *       404:
 *         description: Journal entry not found
 *
 *       409:
 *         description: Invalid journal entry ID
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/journal-entries/{id}/reverse:
 *   post:
 *     summary: Reverse journal entry
 *     tags: [Journal Entries]
 *     description: |
 *       Reverse an existing journal entry.
 *
 *       Rules:
 *       - Already reversed journal cannot be reversed again
 *       - Creates a new reverse journal entry automatically
 *     parameters:
 *       - $ref: '#/components/parameters/journalEntryId'
 *     responses:
 *       201:
 *         description: Journal entry reversed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *
 *       400:
 *         description: Journal already reversed
 *
 *       404:
 *         description: Journal entry not found
 *
 *       409:
 *         description: Invalid journal entry ID
 *
 *       500:
 *         description: Server error
 */
