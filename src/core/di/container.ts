// Container DI simples para manter baixo acoplamento inicialmente
// Extensível para futuras resoluções lazy e escopos.

type Factory<T> = () => T;

class ServiceContainer {
  private singletons = new Map<string, unknown>();
  private factories = new Map<string, Factory<unknown>>();

  registerSingleton<T>(token: string, instance: T): void {
    if (this.singletons.has(token)) throw new Error(`Token já registrado: ${token}`);
    this.singletons.set(token, instance);
  }

  registerFactory<T>(token: string, factory: Factory<T>): void {
    if (this.factories.has(token) || this.singletons.has(token)) throw new Error(`Token já registrado: ${token}`);
    this.factories.set(token, factory);
  }

  resolve<T>(token: string): T {
    if (this.singletons.has(token)) return this.singletons.get(token) as T;
    if (this.factories.has(token)) return this.factories.get(token)!() as T;
    throw new Error(`Serviço não encontrado: ${token}`);
  }
}

export const container = new ServiceContainer();

// Tokens centralizados para evitar strings mágicas (SRP + DRY)
export const TOKENS = {
  ChallengeRepository: 'ChallengeRepository',
  SubmissionService: 'SubmissionService'
} as const;
