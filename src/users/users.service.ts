import { Injectable, NotFoundException, Inject ,BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { appConfig } from 'src/config/app.config';
import { IAppConfig } from 'src/config/types';
import { UUID } from 'crypto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(appConfig.KEY)
    private readonly appConfig: IAppConfig,
  ) {}

  async findOneById(id: UUID): Promise<User> {
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

  async updateUser(id: UUID, updateData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...updateData,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
}
  async updatePassword(id:UUID, oldPassword: string, newPassword: string) {
    const user = await this.findOneById(id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (isMatch) {
      const hashedNewPassword = await bcrypt.hash(newPassword, this.appConfig.bcryptSalt);
      await this.userRepository.update(id, { password: hashedNewPassword });
      return {message: "Пароль успешно обновлен"};
    } else {
      throw new BadRequestException(`Старый пароль не совпадает`);
    }
  }
}
