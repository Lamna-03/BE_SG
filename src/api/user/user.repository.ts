import { AppDataSource } from "../../configs/typeorm.config";
import { User } from "../../common/entities/user.entity";

//Lay ra repository cua entity User
export const userRepository = AppDataSource.getRepository(User);