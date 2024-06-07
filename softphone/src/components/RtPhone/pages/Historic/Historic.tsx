/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";

import api from "../../api";
import { useAppSelector } from "../../store/hooks";
import { formatDate } from "date-fns";
import { Icon, Input } from "rtk-ux";
import { Container, ItemDetails, ItemName, ListItem, ScrollableArea, SearchResults, StickyHeader, Title } from "./styled";
import { Loading } from "../../components/CustomSpinner/CustomSpinner";

export default function Historic() {
    const pbxExtension = useAppSelector((state) => state.phone.pbxExtension);
    const number = pbxExtension?.number;
    // const number = 1003;
    const [historic, setHistoric] = useState<any[]>();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const data = {
            custom_filter: [
                {
                    $match: {
                        $or: [
                            {
                                dst: number.toString(),
                            },
                            {
                                src: number.toString(),
                            },
                        ],
                        lastapp: "Dial",
                    },
                },
                {
                    $limit: 10,
                },
            ],
        };
        async function fetchHistoric() {
            setLoading(true);
            try {
                const response = await api.post("/api/_pbx_cdr/filter?$type=query", data);
                setHistoric(response.data.data || []);
            } catch (error) {
                console.error("Falha ao buscar o histÃ³rico:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistoric();
    }, []);

    return (
        <Container>
            <StickyHeader>
                <Title>Registro de chamadas</Title>
                <Input size="large" type="text" placeholder="Pesquisar..." onChange={(e: any) => setSearch(e.target.value)} />
                {search && (
                    <SearchResults>
                        Resultados para <span className="text-bold text-slate-600">{search}</span>
                    </SearchResults>
                )}
            </StickyHeader>

            <ScrollableArea>
                {loading ? (
                    <Loading />
                ) : historic && historic.length > 0 ? (
                    historic
                        .filter(
                            (item) => item.src.includes(search) || item.dst.includes(search)
                            //tolowercase()
                        )
                        .map((item) => (
                            <ListItem key={item._id}>
                                <ItemDetails>
                                    <div className="flex items-center justify-center">
                                        {item.disposition === "ANSWERED" ? (
                                            <Icon className="text-green-500" icon={["fas", "phone-arrow-right"]} />
                                        ) : item.disposition === "NO ANSWER" ? (
                                            <Icon className="text-red-500" icon={["fas", "phone-arrow-down-left"]} />
                                        ) : (
                                            <Icon className="text-yellow-500" icon={["fas", "phone-slash"]} />
                                        )}
                                    </div>
                                    <div className="ml-3 flex justify-between w-full">
                                        <div className="text-center items-center flex text-sm">{item.disposition === "ANSWERED" ? item.src : item.dst}</div>
                                        <div className="flex flex-col items-end gap-1">
                                            <ItemName>
                                                <div className="text-xs">
                                                    {Math.floor(item.duration / 60)
                                                        .toString()
                                                        .padStart(2, "0")}
                                                    :{(item.duration % 60).toString().padStart(2, "0")}
                                                </div>
                                            </ItemName>
                                            <div className="text-xs text-zinc-500 font-light">{formatDate(new Date(item.calldate), item.calldate < new Date().setHours(0, 0, 0, 0) ? "HH:mm" : "dd/MM/yyyy hh:mm")}</div>
                                        </div>
                                    </div>
                                </ItemDetails>
                            </ListItem>
                        ))
                ) : (
                    <p className="text-center text-sm text-gray-400">Nenhuma chamada registrada.</p>
                )}
            </ScrollableArea>
        </Container>
    );
}
