import { ValidatedCreateHandler } from "@/server/controllers/validatedCreateHandler";
import { userService, DuplicateEmailError, type UserCreateInput, type UserSummary } from "@/server/services/userService";

/**
 * TEMPLATE METHOD: preenche os passos do ValidatedCreateHandler para um
 * administrador criar a conta de outra pessoa pela tela de gestão de usuários.
 * É diferente do /api/auth/signup, então não passa pela checagem da lista
 * AML/KYC que existe no cadastro feito pelo próprio usuário.
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
