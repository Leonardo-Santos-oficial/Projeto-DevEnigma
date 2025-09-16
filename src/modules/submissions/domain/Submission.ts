import type { SubmissionStatus } from './SubmissionStatus';

export interface SubmissionProps {
  id: string;
  code: string;
  challengeId: string;
  userId: string;
  status: SubmissionStatus;
  passed: boolean;
  executionTime?: number | null;
  memoryUsage?: number | null;
  createdAt: Date;
}

export class Submission {
  private constructor(private props: SubmissionProps) {}

  static create(props: SubmissionProps): Submission {
    if (!props.code.trim()) throw new Error('Submission.code vazio');
    if (!props.challengeId) throw new Error('Submission.challengeId ausente');
    if (!props.userId) throw new Error('Submission.userId ausente');
    return new Submission(props);
  }

  get id() { return this.props.id; }
  get code() { return this.props.code; }
  get challengeId() { return this.props.challengeId; }
  get userId() { return this.props.userId; }
  get status() { return this.props.status; }
  get passed() { return this.props.passed; }
  get executionTime() { return this.props.executionTime ?? null; }
  get memoryUsage() { return this.props.memoryUsage ?? null; }
  get createdAt() { return this.props.createdAt; }

  withStatus(status: SubmissionStatus, passed: boolean): Submission {
    return Submission.create({ ...this.props, status, passed });
  }

  toPlain(): SubmissionProps {
    return { ...this.props };
  }
}
