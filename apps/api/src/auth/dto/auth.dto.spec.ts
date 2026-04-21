import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';
import { SignupDto } from './signup.dto';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ResetPasswordDto } from './reset-password.dto';

describe('Auth DTOs', () => {
  describe('LoginDto', () => {
    it('should validate correct login data', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid email format', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'not-an-email',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should reject short password', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
        password: 'short',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should reject missing email', async () => {
      const dto = plainToInstance(LoginDto, {
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing password', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('SignupDto', () => {
    it('should validate correct signup data', async () => {
      const dto = plainToInstance(SignupDto, {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        orgName: 'My Clinic',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid email format', async () => {
      const dto = plainToInstance(SignupDto, {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        orgName: 'My Clinic',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject short password', async () => {
      const dto = plainToInstance(SignupDto, {
        email: 'newuser@example.com',
        password: 'short',
        firstName: 'John',
        orgName: 'My Clinic',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing required fields', async () => {
      const dto = plainToInstance(SignupDto, {
        email: 'newuser@example.com',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ForgotPasswordDto', () => {
    it('should validate correct email', async () => {
      const dto = plainToInstance(ForgotPasswordDto, {
        email: 'test@example.com',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid email format', async () => {
      const dto = plainToInstance(ForgotPasswordDto, {
        email: 'not-an-email',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ResetPasswordDto', () => {
    it('should validate correct reset password data', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        access_token: 'valid-token',
        new_password: 'newpassword123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject short new password', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        access_token: 'valid-token',
        new_password: 'short',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing access token', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        new_password: 'newpassword123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
