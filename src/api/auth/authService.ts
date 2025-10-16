import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import { UserRepository } from "../user/user.repository";
import { User } from "../../common/entities/User.entity";
import { MailTrigger } from "../../common/enums/enumBase";
import {
  ResponseStatus,
  ServiceResponse,
} from "../../common/models/serviceResponse";
import { generateJwt, verifyJwt } from "../../common/utils/jwtUtils";
import { sendEmail } from "../../common/utils/mailService";
import { Login, Token } from "./schemas/authSchema";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(userData: User): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.findByEmail(userData.email);
      if (user) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          "Email already exists",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = await this.userRepository.createUser({
        ...userData,
        password: hashedPassword,
      });

      if (!newUser) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          "Error creating user",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const activationLink = `${
        process.env.FRONTEND_URL
      }/activate?token=${generateJwt({ code: newUser.id })}`;
      sendEmail(MailTrigger.VerifyEmail, {
        email: userData.email,
        activationLink,
      });

      return new ServiceResponse<User>(
        ResponseStatus.SUCCESS,
        "User registered successfully! Please check your email to activate your account.",
        newUser,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating user: ${(ex as Error).message}`;
      return new ServiceResponse(
        ResponseStatus.FAIL,
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async verifyEmail(token: string): Promise<ServiceResponse<boolean>> {
    try {
      const decoded = verifyJwt(token);

      // Extract the user ID from the decoded JWT payload
      let userId: string;
      if (
        typeof decoded === "object" &&
        decoded !== null &&
        "code" in decoded
      ) {
        userId = (decoded as any).code;
      } else {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          "Invalid token format",
          false,
          StatusCodes.BAD_REQUEST
        );
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          "User not found",
          false,
          StatusCodes.NOT_FOUND
        );
      }

      if (user.isActive) {
        return new ServiceResponse(
          ResponseStatus.SUCCESS,
          "Email already verified",
          true,
          StatusCodes.OK
        );
      }

      user.isActive = true;
      await this.userRepository.updateUser(user.id, user);

      return new ServiceResponse<boolean>(
        ResponseStatus.SUCCESS,
        "Email verified successfully",
        true,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error verifying email: ${(ex as Error).message}`;
      console.error(errorMessage);
      return new ServiceResponse(
        ResponseStatus.FAIL,
        errorMessage,
        false,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Login user
  async login(loginData: Login): Promise<ServiceResponse<Token | null>> {
    try {
      const user = await this.userRepository.findByEmail(loginData.email);
      if (!user) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (!user.isActive) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          "User is not activated",
          null,
          StatusCodes.UNAUTHORIZED
        );
      }

      const passwordMatch = await bcrypt.compare(
        loginData.password,
        user.password
      );
      if (!passwordMatch) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          "Invalid password",
          null,
          StatusCodes.UNAUTHORIZED
        );
      }

      const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
      const token: Token = {
        accessToken: generateJwt({ userId: user.id }),
        refreshToken: generateJwt({ userId: user.id }),
        expiresIn: expiresIn,
        tokenType: "Bearer",
      };

      return new ServiceResponse<Token>(
        ResponseStatus.SUCCESS,
        "Login successful",
        token,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error logging in: ${(ex as Error).message}`;
      console.error(errorMessage);
      return new ServiceResponse(
        ResponseStatus.FAIL,
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshToken(oldRefreshToken: string): Promise<ServiceResponse<Token | null>> {
    try {
      const decoded = verifyJwt(oldRefreshToken);
      if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          'Invalid refresh token',
          null,
          StatusCodes.UNAUTHORIZED
        );
      }
      const userId = (decoded as any).userId;
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return new ServiceResponse(
          ResponseStatus.FAIL,
          'User not found',
          null,
          StatusCodes.NOT_FOUND
        );
      } 
      const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
      const newToken: Token = {
        accessToken: generateJwt({ userId: user.id }),
        refreshToken: generateJwt({ userId: user.id }),
        expiresIn: expiresIn,
        tokenType: 'Bearer',
      };

      return new ServiceResponse<Token>(
        ResponseStatus.SUCCESS,
        'Token refreshed successfully',
        newToken,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error refreshing token: ${(ex as Error).message}`;
      console.error(errorMessage);
      return new ServiceResponse(
        ResponseStatus.FAIL,
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const authService = new AuthService(new UserRepository());
