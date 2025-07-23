import {useEffect,useRef,useState} from "react";

export default function useWebsocket(auctionId:string) {
    const [highestBid, setHighestBid] = useState<number | null >(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8080`);
        ws.current.onopen = () => {
            ws.current?.send(auctionId);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.auction_id === auctionId) {
                setHighestBid(Number(data.highest_bid));
            }
        };

        return () => {
            ws.current?.close();
        };
    }, [auctionId]);
    return highestBid;
}