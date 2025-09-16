export interface TestCaseProps {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  challengeId: string;
}

// Entidade simples mantendo invariantes (SRP)
export class TestCase {
  private constructor(private props: TestCaseProps) {}

  static create(props: TestCaseProps): TestCase {
    if (!props.input.trim()) throw new Error('TestCase.input vazio');
    if (props.expectedOutput == null) throw new Error('TestCase.expectedOutput ausente');
    return new TestCase(props);
  }

  get id() { return this.props.id; }
  get input() { return this.props.input; }
  get expectedOutput() { return this.props.expectedOutput; }
  get isHidden() { return this.props.isHidden; }
  get challengeId() { return this.props.challengeId; }
}
