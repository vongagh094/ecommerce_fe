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
                console.log("Websocket received data: ", data.auction_id);
                console.log("Websocket received data: ", data.highest_bid);
                setHighestBid(Number(data.highest_bid));
            }
        };

        return () => {
            ws.current?.close();
        };
    }, [auctionId]);
    return highestBid;
}