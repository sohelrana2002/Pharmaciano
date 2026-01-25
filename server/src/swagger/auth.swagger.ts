/**
 * @swagger
 * components:
 *   responses:
 *     Success:
 *       description: Successful response
 *     Created:
 *       description: Resource created
 *     BadRequest:
 *       description: Bad request
 *     Unauthorized:
 *       description: Unauthorized
 *     ServerError:
 *       description: Server error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
