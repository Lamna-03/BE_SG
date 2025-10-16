import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Request, Response, Router } from "express";
import { z } from "zod";

import { PostUser, PostUserSchema } from "../user/schemas/createUserSchema";
import { UserSchema } from "../user/schemas/userSchema";
import { createApiResponse } from "../../api-docs/openAPIResponseBuilders";
import {
  handleServiceResponse,
  validateRequest,
} from "../../common/utils/httpHandlers";

import { authService } from "./authService";
import {
  Login,
  PostLogin,
  PostLoginSchema,
  PostVerifyEmailSchema,
  TokenSchema,
} from "./schemas/authSchema";

export const authRegistry = new OpenAPIRegistry();

authRegistry.register("Token", TokenSchema);
authRegistry.register("PostLogin", PostLoginSchema);

const router = express.Router();

// Registering OpenAPI paths
const registerPaths = () => {
  authRegistry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    request: { body: PostUser },
    responses: createApiResponse(UserSchema, "Success"),
  });

  authRegistry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    request: { body: PostLogin },
    responses: createApiResponse(TokenSchema, "Success"),
  });

  authRegistry.registerPath({
    method: "post",
    path: "/auth/verify-email?token={token}",
    tags: ["Auth"],
    request: { query: PostVerifyEmailSchema.shape.query },
    responses: createApiResponse(z.boolean(), "Success", 201),
  });

 authRegistry.registerPath({
    method: "post",
    path: "/auth/refresh-token",
    tags: ["Auth"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              refreshToken: z.string().describe("JWT refresh token"),
            }),
          },
        },
      },
    },

    responses: createApiResponse(TokenSchema, "Success"),
  });
};

// Route to create a new user
router.post(
  "/register",
  validateRequest(PostUserSchema),
  async (req: Request, res: Response) => {
    const userData = req.body;
    const serviceResponse = await authService.register(userData);
    handleServiceResponse(serviceResponse, res);
  }
);

// Route to verify email
router.post(
  "/verify-email",
  validateRequest(PostVerifyEmailSchema),
  async (req: Request, res: Response) => {
    const token = req.query.token as string;
    const serviceResponse = await authService.verifyEmail(token);
    handleServiceResponse(serviceResponse, res);
  }
);

// Route to login
router.post(
  "/login",
  validateRequest(PostLoginSchema),
  async (req: Request, res: Response) => {
    const userData = req.body as Login;
    const serviceResponse = await authService.login(userData);
    handleServiceResponse(serviceResponse, res);
  }
);

// router.post("/logout", async (req: Request, res: Response) => {
//   const refreshToken = req.body.refreshToken;
//   const serviceResponse = await authService.logout(refreshToken);
//   handleServiceResponse(serviceResponse, res);
// });

router.post("/refresh-token", async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: "Refresh token is required" });
  }
  const serviceResponse = await authService.refreshToken(refreshToken);
  handleServiceResponse(serviceResponse, res);
}
);

registerPaths();

export const authRouter: Router = router;
