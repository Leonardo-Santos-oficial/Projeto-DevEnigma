import { NextResponse } from 'next/server';
import '@core/bootstrap';
import { container, TOKENS } from '@core/di/container';
import type { Logger } from '@core/logging/Logger';
import type { SubmissionService, CreateSubmissionInput } from '@modules/submissions/domain/SubmissionService';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateSubmissionInput>;
    if (!body.code || !body.challengeId || !body.userId || !body.language) {
      return NextResponse.json({ error: 'Campos obrigatórios: code, challengeId, userId, language' }, { status: 400 });
    }

    const service = container.resolve<SubmissionService>(TOKENS.SubmissionService);
    const logger = container.resolve<Logger>('Logger');
    logger.info('api.submission.request', { challengeId: body.challengeId, language: body.language });
    const result = await service.submit(body as CreateSubmissionInput);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    try {
      const logger = container.resolve<Logger>('Logger');
      logger.error('api.submission.error', { error: (err as Error).message });
    } catch {}
    return NextResponse.json({ error: 'Erro ao processar submissão' }, { status: 500 });
  }
}
