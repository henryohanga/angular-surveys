import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestUser {
  id: string;
  email: string;
  role: string;
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@Request() req: { user: RequestUser }) {
    return this.usersService.findById(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async updateProfile(
    @Request() req: { user: RequestUser },
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Request() req: { user: RequestUser }, @Param('id') id: string) {
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      throw new Error('Forbidden');
    }
    return this.usersService.remove(id);
  }

  // ==================== DEVELOPER SETTINGS ====================

  @Get('me/developer-settings')
  @ApiOperation({ summary: 'Get developer settings for current user' })
  @ApiResponse({ status: 200, description: 'Developer settings' })
  async getDeveloperSettings(@Request() req: { user: RequestUser }) {
    return this.usersService.getDeveloperSettings(req.user.id);
  }

  @Patch('me/developer-settings')
  @ApiOperation({ summary: 'Update developer settings for current user' })
  @ApiResponse({ status: 200, description: 'Developer settings updated' })
  async updateDeveloperSettings(
    @Request() req: { user: RequestUser },
    @Body() dto: { enabled?: boolean }
  ) {
    return this.usersService.updateDeveloperSettings(req.user.id, dto);
  }

  @Post('me/developer-settings/regenerate')
  @ApiOperation({ summary: 'Regenerate API credentials' })
  @ApiResponse({ status: 200, description: 'Credentials regenerated' })
  async regenerateCredentials(@Request() req: { user: RequestUser }) {
    return this.usersService.regenerateCredentials(req.user.id);
  }
}
