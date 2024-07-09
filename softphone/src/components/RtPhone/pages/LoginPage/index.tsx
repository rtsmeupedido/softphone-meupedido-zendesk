import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { Button, Input } from "rtk-ux";
import { useAuth } from "../../hooks/useAuth";

const LoginPage = () => {
  const { user, token } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await login(email, senha);
      navigate("/home");
    } catch (err) {
      console.error("Erro ao fazer login", err);
    }
  };

  useEffect(() => {
    if (user && token) {
      navigate("/home");
    }
  }, [user, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="h-1/3 w-full flex items-center justify-center">
        <img
          src="https://meupedi.do/wp-content/uploads/2023/05/Logo-meu.-pedido-principal-fundo-claro.svg"
          width={250}
          className="mb-4"
        />
      </div>
      <div className="h-1/2 w-full">
        <form
          onSubmit={handleSubmit}
          className="flex items-center flex-col gap-4 flex-1 h-full px-4"
        >
          <div className="flex flex-col mb-2 w-full gap-4">
            <Input
              status={error ? "error" : ""}
              size="large"
              id="email"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <Input.Password
              status={error ? "error" : ""}
              size="large"
              id="senha"
              placeholder="Senha"
              value={senha}
              onChange={(e: any) => setSenha(e.target.value)}
              required
              className="w-full"
            />
            {error && (
              <div className="text-sm text-red-500 text-center -mt-3">
                E-mail ou senha inválidos.
              </div>
            )}
          </div>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            disabled={loading}
            loading={loading}
            block
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
