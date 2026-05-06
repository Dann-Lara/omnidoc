import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { PatientNotesService } from './patient-notes.service'
import { CreateNoteDto } from './dto/create-note.dto'

@ApiTags('patient-notes')
@Controller('patients/:patientId/notes')
export class PatientNotesController {
  private readonly logger = new Logger(PatientNotesController.name)

  constructor(private readonly notesService: PatientNotesService) {}

  // Get single note by ID (public, no auth)
  @Get(':id')
  async getNoteById(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
  ) {
    this.logger.log(`[getNoteById] noteId: ${id}, patientId: ${patientId}`)
    return this.notesService.findOne(undefined, patientId, id)
  }

  // List all notes (requires auth)
  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'List all notes for a patient' })
  @ApiResponse({ status: 200, description: 'List of notes' })
  async findAll(@Param('patientId') patientId: string, @Req() req: any) {
    this.logger.log(`[findAll] patientId: ${patientId}, user: ${JSON.stringify(req.user)}`)
    const organizationId = req.user.organizationId
    return this.notesService.findAll(organizationId, patientId)
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created' })
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateNoteDto,
    @Req() req: any,
  ) {
    const userData = req.user || {}
    let userId = userData.id
    let organizationId = userData.organizationId
    
    if (!userId) {
      const accessToken = req.cookies?.['sb-access-token']
      if (accessToken) {
        throw new UnauthorizedException('User not authenticated properly')
      }
    }
    
    return this.notesService.create(userId, organizationId, patientId, dto)
  }

  @Post(':id/seal')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seal a note' })
  @ApiResponse({ status: 200, description: 'Note sealed' })
  async seal(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.notesService.seal(userId, organizationId, patientId, id)
  }

  @Post(':id/send')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send note to patient email' })
  @ApiResponse({ status: 200, description: 'Email sent' })
  async sendToPatient(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Body() body: { email: string },
    @Req() req: any,
  ) {
    const userId = req.user.id
    const organizationId = req.user.organizationId
    return this.notesService.sendToPatient(userId, organizationId, patientId, id, body.email)
  }
}