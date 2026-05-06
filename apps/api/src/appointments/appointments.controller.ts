import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common'
import { Request } from 'express'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { AppointmentsService } from './appointments.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto'

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(SupabaseAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get appointment KPIs' })
  @ApiResponse({ status: 200, description: 'Appointment KPIs' })
  getKpis(@Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.getKpis(organizationId)
  }

  @Get()
  @ApiOperation({ summary: 'List all appointments' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  findAll(@Query() query: ListAppointmentsQueryDto, @Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.findAll(organizationId, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.findOne(organizationId, id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.create(organizationId, createAppointmentDto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: Request,
  ) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.update(organizationId, id, updateAppointmentDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.remove(organizationId, id)
  }

  @Post(':id/resend-email')
  @ApiOperation({ summary: 'Resend appointment confirmation email' })
  @ApiResponse({ status: 200, description: 'Email resent successfully' })
  @ApiResponse({ status: 400, description: 'Patient has no email' })
  async resendEmail(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.resendAppointmentConfirmationEmail(organizationId, id)
  }

  @Get('specialty/:specialtyId')
  @ApiOperation({ summary: 'Get appointments by specialty' })
  @ApiResponse({ status: 200, description: 'List of appointments for specialty' })
  findBySpecialty(
    @Param('specialtyId') specialtyId: string,
    @Req() req: Request,
  ) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.findBySpecialty(organizationId, specialtyId)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status only' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
    @Req() req: Request,
  ) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.updateStatus(organizationId, id, body.status)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get appointment counts by specialty' })
  @ApiResponse({ status: 200, description: 'Appointment counts grouped by specialty' })
  getAppointmentStats(@Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.getAppointmentStats(organizationId)
  }

  @Get(':id/audit-log')
  @ApiOperation({ summary: 'Get audit log for an appointment' })
  @ApiResponse({ status: 200, description: 'Audit log entries for the appointment' })
  getAuditLog(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const organizationId = (req as any).user.organizationId
    return this.appointmentsService.getAuditLog(organizationId, id)
  }
}
