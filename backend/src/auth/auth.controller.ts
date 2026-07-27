import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ─── POST /api/auth/register ────────────────────────────────────

  @Post('register')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'User created successfully with JWT token' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ─── POST /api/auth/login ───────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful — returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── GET /api/auth/me ───────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  getMe(@Request() req: any) {
    const { password, ...user } = req.user;
    return user;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change own password' })
  changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  // ─── POST /api/auth/invite ──────────────────────────────────────
  // Admin generates a shareable invite link for their workspace

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate an invite link for a team member (Admin only)' })
  @ApiResponse({ status: 201, description: 'Returns a shareable invite URL valid for 7 days' })
  createInvite(@Request() req: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://ai-lead-os-eight.vercel.app';
    return this.authService.createInvite(req.user.tenantId, frontendUrl);
  }

  // ─── POST /api/auth/accept-invite ──────────────────────────────
  // New employee registers using an invite token — joins the same workspace

  @Post('accept-invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register as a team member using an invite link' })
  @ApiResponse({ status: 201, description: 'User created and joined the workspace — returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid, used, or expired token' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  acceptInvite(@Body() body: { token: string; name: string; email: string; password: string }) {
    return this.authService.acceptInvite(body);
  }
}


