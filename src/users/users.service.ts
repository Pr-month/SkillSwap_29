import { Injectable, NotFoundException, Inject ,BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { appConfig } from 'src/config/app.config';
import { IAppConfig } from 'src/config/types';
import { UsersQueryDto } from './dto/users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(appConfig.KEY)
    private readonly appConfig: IAppConfig,
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
  
  async getAllUsers(query: UsersQueryDto): Promise<{ data: User[]; count: number }> {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const options: FindManyOptions<User> = {
      take: limit,
      skip: offset,
    };

    const [data, count] = await this.userRepository.findAndCount(options);
    return { data, count };
  }

  async updatePassword(id:string, oldPassword: string, newPassword: string) {
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
