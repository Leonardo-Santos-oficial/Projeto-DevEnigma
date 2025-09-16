// Entidade de domínio Challenge (independente de persistência)
export interface ChallengeProps {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Challenge {
  private readonly props: ChallengeProps;

  private constructor(props: ChallengeProps) {
    this.props = props;
  }

  static create(props: ChallengeProps): Challenge {
    // Validações de invariantes de domínio (SRP: centralizadas na entidade)
    if (!props.title || props.title.trim().length < 3) {
      throw new Error('Challenge title deve ter ao menos 3 caracteres');
    }
    if (props.description.trim().length < 10) {
      throw new Error('Challenge description mínima de 10 caracteres');
    }
    const allowedDifficulties = ['EASY','MEDIUM','HARD'] as const;
    if (!allowedDifficulties.includes(props.difficulty)) {
      throw new Error('Difficulty inválida');
    }
    if (!props.language || props.language.trim().length === 0) {
      throw new Error('Language obrigatória');
    }
    return new Challenge(props);
  }

  get id() { return this.props.id; }
  get title() { return this.props.title; }
  get description() { return this.props.description; }
  get starterCode() { return this.props.starterCode; }
  get difficulty() { return this.props.difficulty; }
  get language() { return this.props.language; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
}
