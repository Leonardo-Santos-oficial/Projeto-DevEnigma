export interface ProfileProps {
  id: string; // userId
  username: string;
  solved: number; // total desafios resolvidos (primeira vez)
  attempts: number; // total de submissões
  lastSubmissionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Profile implements ProfileProps {
  id: string;
  username: string;
  solved: number;
  attempts: number;
  lastSubmissionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  private constructor(props: ProfileProps) {
    this.id = props.id;
    this.username = props.username;
    this.solved = props.solved;
    this.attempts = props.attempts;
    this.lastSubmissionAt = props.lastSubmissionAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createNew(id: string, username: string): Profile {
    const now = new Date();
    return new Profile({
      id,
      username,
      solved: 0,
      attempts: 0,
      lastSubmissionAt: null,
      createdAt: now,
      updatedAt: now
    });
  }

  registerSubmission(passed: boolean, firstTimeSolved: boolean) {
    this.attempts += 1;
    if (passed && firstTimeSolved) this.solved += 1;
    this.lastSubmissionAt = new Date();
    this.updatedAt = new Date();
  }
}
