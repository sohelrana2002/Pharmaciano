/**
 * @swagger
 * tags:
 *   - name: AI Forecasting
 *     description: AI-powered medicine demand forecasting APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ForecastItem:
 *       type: object
 *       properties:
 *         medicine_id:
 *           type: string
 *           example: 6851b18fcb234fa92f45f111
 *         medicine_name:
 *           type: string
 *           example: Napa 500mg
 *         batch_no:
 *           type: string
 *           example: BATCH-1001
 *         predicted_sales_next_30_days:
 *           type: integer
 *           example: 120
 *         current_stock:
 *           type: integer
 *           example: 85
 *         expiry_date:
 *           type: string
 *           format: date
 *           example: 2027-05-20
 *         reorder_recommendation:
 *           type: string
 *           example: Reorder within 10 days to avoid stock shortage.
 *         confidence:
 *           type: string
 *           enum:
 *             - High
 *             - Medium
 *             - Low
 *           example: High
 *
 *   parameters:
 *     forecastOrganizationId:
 *       in: query
 *       name: organizationId
 *       schema:
 *         type: string
 *       description: Organization ID (Super Admin only)
 *
 *     forecastBranchId:
 *       in: query
 *       name: branchId
 *       schema:
 *         type: string
 *       description: Branch ID (Super Admin only)
 *
 *     medicineName:
 *       in: query
 *       name: medicineName
 *       schema:
 *         type: string
 *       description: Filter by medicine name
 *
 *     barcode:
 *       in: query
 *       name: barcode
 *       schema:
 *         type: string
 *       description: Filter by medicine barcode
 *
 *     forecastFromDate:
 *       in: query
 *       name: fromDate
 *       schema:
 *         type: string
 *         format: date
 *       description: Start date for sales history. Default is last 3 months.
 *
 *     forecastToDate:
 *       in: query
 *       name: toDate
 *       schema:
 *         type: string
 *         format: date
 *       description: End date for sales history. Default is today.
 *
 *     forecastPage:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *
 *     forecastLimit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 10
 */

/**
 * @swagger
 * /api/v1/ai-forecasting:
 *   get:
 *     summary: Generate AI medicine demand forecast
 *     tags: [AI Forecasting]
 *     description: |
 *       Generates AI-powered demand forecasting for medicine batches based on
 *       historical sales, current inventory, and expiry information.
 *
 *       **Default behavior**
 *       - Uses the last **3 months** of sales history when `fromDate` is not provided.
 *       - Predicts the **next 30 days** demand.
 *       - Results are cached in Redis for **1 hour**.
 *
 *       **Normal User**
 *       - Organization and branch are taken automatically from the authenticated user.
 *       - Cannot specify organizationId or branchId.
 *
 *       **Super Admin**
 *       - Can optionally filter by organizationId and branchId.
 *
 *     parameters:
 *       - $ref: '#/components/parameters/forecastOrganizationId'
 *       - $ref: '#/components/parameters/forecastBranchId'
 *       - $ref: '#/components/parameters/medicineName'
 *       - $ref: '#/components/parameters/barcode'
 *       - $ref: '#/components/parameters/forecastFromDate'
 *       - $ref: '#/components/parameters/forecastToDate'
 *       - $ref: '#/components/parameters/forecastPage'
 *       - $ref: '#/components/parameters/forecastLimit'
 *
 *     responses:
 *       200:
 *         description: Forecast generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       example: 35
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *
 *                 meta:
 *                   type: object
 *                   properties:
 *                     organizationId:
 *                       type: string
 *                       example: 6851b18fcb234fa92f45f112
 *                     branchId:
 *                       type: string
 *                       example: 6851b18fcb234fa92f45f113
 *                     filterApplied:
 *                       oneOf:
 *                         - type: string
 *                           example: None (Full Filtered Criteria)
 *                         - type: object
 *                     analyzedFrom:
 *                       type: string
 *                       format: date
 *                       example: 2026-01-01
 *                     analyzedTo:
 *                       type: string
 *                       format: date
 *                       example: 2026-03-31
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     forecast:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ForecastItem'
 *
 *       404:
 *         description: No sales history found or medicine not found
 *
 *       500:
 *         description: Server error
 */
