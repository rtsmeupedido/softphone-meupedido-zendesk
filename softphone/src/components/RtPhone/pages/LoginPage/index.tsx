import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { Button, Input } from "rtk-ux";
import { useAuth } from "../../hooks/useAuth";
import { useAppSelector } from "../../store/hooks";
import logo from "../../../../assets/logoruntask-m.svg";

const LoginPage = () => {
    const user = useAppSelector((s) => s.user.data);
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
        if (user?._id) {
            navigate("/home");
        }
    }, [user?._id, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="h-1/3 w-full flex items-center justify-center relative">
                <div className="relative">
                    <img src={logo} className="h-12" />
                    <span className="-bottom-4 absolute right-0">softphone</span>
                </div>
            </div>
            <div className="h-1/2 w-full">
                <form onSubmit={handleSubmit} className="flex items-center flex-col gap-4 flex-1 h-full px-4">
                    <div className="flex flex-col mb-2 w-full gap-4">
                        <Input status={error ? "error" : ""} size="large" id="email" type="email" placeholder="E-mail" value={email} onChange={(e: any) => setEmail(e.target.value)} required className="w-full" />
                        <Input.Password status={error ? "error" : ""} size="large" id="senha" placeholder="Senha" value={senha} onChange={(e: any) => setSenha(e.target.value)} required className="w-full" />
                        {error && <div className="text-sm text-red-500 text-center -mt-3">E-mail ou senha inválidos.</div>}
                    </div>
                    <Button size="large" type="primary" htmlType="submit" disabled={loading} loading={loading} block>
                        Entrar
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
