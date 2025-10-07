import { User } from "../../common/entities/user.entity";
import { UserRepository } from "./user.repository";
import { ResponseStatus, ServiceResponse } from "../../common/models/serviceResponse"; 
import { CreateUserType, UserType } from "./user.model";

//Service se chua logic nghiep vu lien quan den User
export class UserService {
    constructor(private userRepository = new UserRepository()) {}

    async findAll(): Promise<ServiceResponse<UserType[] | null>> {
        try{
            const users = await this.userRepository.findAll();
            if(users.length === 0 || !users) {
                return new ServiceResponse(ResponseStatus.FAIL, "No users found", null, 404);
            }
            return new ServiceResponse(ResponseStatus.SUCCESS, "Users retrieved successfully", users, 200);
        } catch (error) {
            console.error("Error retrieving users:", error);
            return new ServiceResponse(ResponseStatus.ERROR, "Error retrieving users", null, 500);
        }
    }

    async findById(id: number): Promise<ServiceResponse<UserType | null>> {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                return new ServiceResponse(ResponseStatus.FAIL, "User not found", null, 404);
            }
            return new ServiceResponse(ResponseStatus.SUCCESS, "User retrieved successfully", user, 200);
        } catch (error) {
            console.error("Error retrieving user:", error);
            return new ServiceResponse(ResponseStatus.ERROR, "Error retrieving user", null, 500);
        }
    }

    async createUser(userData: CreateUserType): Promise<ServiceResponse<UserType | null>> {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                return new ServiceResponse(ResponseStatus.FAIL, "Email already in use", null, 400);
            }
            const newUser = await this.userRepository.createUser(userData);
            return new ServiceResponse(ResponseStatus.SUCCESS, "User created successfully", newUser, 201);
        } catch (error) {
            console.error("Error creating user:", error);
            return new ServiceResponse(ResponseStatus.ERROR, "Error creating user", null, 500);
        }
    }

    async updateUser(id: number, userData: Partial<UserType>): Promise<ServiceResponse<UserType | null>> {
        try {
            const updatedUser = await this.userRepository.updateUser(id, userData);
            if (!updatedUser) {
                return new ServiceResponse(ResponseStatus.FAIL, "User not found", null, 404);
            }
            return new ServiceResponse(ResponseStatus.SUCCESS, "User updated successfully", updatedUser, 200);
        } catch (error) {
            console.error("Error updating user:", error);
            return new ServiceResponse(ResponseStatus.ERROR, "Error updating user", null, 500);
        }
    }
    async deleteUser(id: number): Promise<ServiceResponse<null>> {
        try {
            const deleted = await this.userRepository.deleteUser(id);
            if (!deleted) {
                return new ServiceResponse(ResponseStatus.FAIL, "User not found", null, 404);
            }
            return new ServiceResponse(ResponseStatus.SUCCESS, "User deleted successfully", null, 200);
        } catch (error) {
            console.error("Error deleting user:", error);
            return new ServiceResponse(ResponseStatus.ERROR, "Error deleting user", null, 500);
        }
    }

}

export const userService = new UserService(new UserRepository());
