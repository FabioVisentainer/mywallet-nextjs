import {ValidatedCreateHandler} from "@/server/controllers/validatedCreateHandler";
import {DuplicateEmailError, type UserCreateInput, userService, type UserSummary} from "@/server/services/userService";

/**
 * TEMPLATE METHOD — passos variáveis para a criação administrativa de uma conta
 * (ver ValidatedCreateHandler). Distinto de /api/auth/signup: aqui é um
 * administrador cadastrando a conta de outra pessoa a partir da tela de gestão
 * de usuários, então não passa pela checagem de watchlist AML/KYC do auto-cadastro.
 */
class CreateUserHandler extends ValidatedCreateHandler<UserCreateInput, UserSummary> {
  protected parse(body: Record<string, unknown>): UserCreateInput {
    return {
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      password: String(body.password || ""),
      role: String(body.role || "Investor").trim(),
    };
  }

  protected validate(input: UserCreateInput) {
    return userService.validate(input);
  }

  protected persist(input: UserCreateInput) {
    return userService.create(input);
  }

  protected entityKey() {
    return "user";
  }

  async handle(request: Request): Promise<Response> {
    try {
      return await super.handle(request);
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        return Response.json({ errors: { email: "An account with this email already exists." } }, { status: 400 });
      }
      throw err;
    }
  }
}

export async function GET() {
  const users = await userService.list();
  return Response.json({ users });
}

export async function POST(request: Request) {
  return new CreateUserHandler().handle(request);
}
