import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  // ==================== DEVELOPER SETTINGS ====================

  async getDeveloperSettings(userId: string): Promise<{
    enabled: boolean;
    apiKey?: string;
    apiSecret?: string;
  }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.developerSettings || { enabled: false };
  }

  async updateDeveloperSettings(
    userId: string,
    dto: { enabled?: boolean }
  ): Promise<{ enabled: boolean; apiKey?: string; apiSecret?: string }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentSettings = user.developerSettings || { enabled: false };

    if (dto.enabled && !currentSettings.apiKey) {
      // Generate credentials when enabling for the first time
      currentSettings.apiKey = this.generateApiKey();
      currentSettings.apiSecret = this.generateApiSecret();
    }

    currentSettings.enabled = dto.enabled ?? currentSettings.enabled;
    user.developerSettings = currentSettings;

    await this.usersRepository.save(user);
    return user.developerSettings;
  }

  async regenerateCredentials(userId: string): Promise<{
    enabled: boolean;
    apiKey?: string;
    apiSecret?: string;
  }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const settings = user.developerSettings || { enabled: false };
    settings.apiKey = this.generateApiKey();
    settings.apiSecret = this.generateApiSecret();
    user.developerSettings = settings;

    await this.usersRepository.save(user);
    return user.developerSettings;
  }

  private generateApiKey(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ask_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateApiSecret(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ass_';
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
