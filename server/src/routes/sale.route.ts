import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  saleSchemaValidator,
  updateSaleValidator,
} from "../validators/sale.validator";
import {
  createSale,
  saleList,
  saleInfo,
  updateSale,
  deleteSale,
} from "../controllers/sale.controller";

const router = Router();

// create sales
router.post(
  "/",
  authenticate,
  authorize(["cashier:manage"]),
  validate(saleSchemaValidator),
  createSale,
);

// list of sales
router.get("/", authenticate, authorize(["cashier:manage"]), saleList);

// individual sale info
router.get("/:id", authenticate, authorize(["cashier:manage"]), saleInfo);

// update sale
router.put(
  "/:id",
  authenticate,
  authorize(["cashier:manage"]),
  validate(updateSaleValidator),
  updateSale,
);

// delete sale
router.delete("/:id", authenticate, authorize(["cashier:manage"]), deleteSale);

export default router;
