import { AppDataSource } from "../../configs/typeorm.config";
import { User } from "../../common/entities/user.entity";

//Lay ra repository cua entity User
export class UserRepository {
  private userRepository = AppDataSource.getRepository(User);

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOneBy({ id });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email });
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) return null;
        this.userRepository.merge(user, userData);
        return this.userRepository.save(user);
    }

    async deleteUser(id: number): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        return result.affected !== 0;
    }

}