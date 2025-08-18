import {biddingAPI} from "@/lib/bidding";
import {BidData} from "@/types/bidding";
import {useState} from "react";
export const useBidding = (bidData: BidData) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleBid = async (bidData:BidData) => {
        setIsSubmitting(true);
        setError(null);
        try{
            await biddingAPI.fetch_sending_bid(bidData);
            await biddingAPI.fetch_receiving_bid();
            setIsSuccess(true);
        }
        catch (error) {
            console.error('Error sending bid:', error);
            setError('Failed to place bid. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return {isSuccess,isSubmitting, error, handleBid};
}

