import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request } from 'express'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { PatientsService } from './patients.service'
import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { ListPatientsQueryDto } from './dto/list-patients-query.dto'

@ApiTags('patients')
@Controller('patients')
@UseGuards(SupabaseAuthGuard)
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name)

  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'List all patients' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  async findAll(@Query() query: ListPatientsQueryDto, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.patientsService.findAll(organizationId, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.patientsService.findOne(userId, organizationId, id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created' })
  async create(@Body() dto: CreatePatientDto, @Req() req: any) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.patientsService.create(userId, organizationId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient' })
  @ApiResponse({ status: 200, description: 'Patient updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Req() req: any,
  ) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.patientsService.update(userId, organizationId, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete patient' })
  @ApiResponse({ status: 200, description: 'Patient deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.patientsService.remove(userId, organizationId, id)
  }
}