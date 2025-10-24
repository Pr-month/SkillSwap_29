import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { appConfig } from 'src/config/app.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async updatePassword(id:string, oldPassword: string, newPassword: string) {
    const user = await this.findOneById(id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (isMatch) {
      const hashedNewPassword = await bcrypt.hash(newPassword, appConfig().bcryptSalt);
      await this.userRepository.update(id, { password: hashedNewPassword });
      return {message: "Пароль успешно обновлен"};
    } else {
      throw new NotFoundException(`Старый пароль не совпадает`);
    }
  }
}
