import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Request, Response, Router } from "express";
import { z } from "zod";

import { PostUser, PostUserSchema } from "./schemas/createUserSchema";
import { GetUserSchema, UserSchema } from "./user.model";
import { UserService } from "./user.service";
import { createApiResponse } from "../../api-docs/openAPIResponseBuilders";
import { handleServiceResponse, validateRequest } from "../../common/utils/httpHandlers";
import { authenticateJWT } from "../../common/middleware/auth.middleware";
export const userRegistry = new OpenAPIRegistry();
userRegistry.register('User', UserSchema);
userRegistry.register('PostUser', PostUserSchema);

const router = express.Router();

//Register OpenAPI paths
const registerPaths = () => {
    userRegistry.registerPath({
        method: "post",
        path: "/users",
        tags: ["Users"],
        request: {
            body: PostUser
        },
        responses: createApiResponse(UserSchema, 'success', 201),
    });

    userRegistry.registerPath({
        method: "get",
        path: "/users/",
        tags: ["Users"],
        responses: createApiResponse(z.array(UserSchema), 'success'),
    });

    userRegistry.registerPath({
        method: "get",
        path: "/users/{id}",
        tags: ["Users"],
        request: {
            params: GetUserSchema.shape.params,
        },
        responses: createApiResponse(UserSchema, 'success'),
    });

    userRegistry.registerPath({
        method: 'get',
        path: '/users/me',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(UserSchema, 'Success'),
    });
};

//router to create user
router.post("/", validateRequest(PostUserSchema), async (req: Request, res: Response) => {
    const userData = req.body;
    const serviceResponse = await new UserService().createUser(userData);
    handleServiceResponse(serviceResponse, res);
});

//get current user profile
router.get('/me', authenticateJWT, async (req: Request, res: Response) => {
    // Assuming you have some middleware that sets req.user based on the authentication token
    const userId = (req as any).user.userId; // Adjust according to your auth implementation
    if (!userId) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const serviceResponse = await new UserService().findById(userId);
    handleServiceResponse(serviceResponse, res);
});

// Route to get a user by id
router.get('/:id', validateRequest(GetUserSchema), async (req: Request, res: Response) => {
  const id = req.params.id;
  const serviceResponse = await new UserService().findById(id);
  handleServiceResponse(serviceResponse, res);
});

registerPaths();

export const userRouter: Router = router;