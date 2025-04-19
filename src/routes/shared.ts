import express from "express";
import * as tokenController from './../controller/shared/token'
const sharedRouter = express.Router();

// Refresh token route
sharedRouter.post("/refresh-token", tokenController.refreshToken);

export default sharedRouter;