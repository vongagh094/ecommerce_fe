const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UpdateStatusResponse {
    success: boolean;
    auction_id: string;
    status: string;
    message: string;
}

export const auctionAPI = {
    // Hàm update status auction
    async updateAuctionStatus(auctionId: string, status: string): Promise<UpdateStatusResponse> {
        try {
            const response = await fetch(`${API_URL}/auctions/update/status/${auctionId}?status=${status}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error(`Failed to update auction status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                auction_id: data.auction_id || auctionId,
                status: data.status || status,
                message: data.message || 'Status updated successfully'
            };
        } catch (error) {
            console.error('Error updating auction status:', error);
            return {
                success: false,
                auction_id: auctionId,
                status: status,
                message: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    },

    // Hàm fetch auctions theo property ID
    async fetchAuctionsByProperty(propertyId: number): Promise<any[]> {
        try {
            const response = await fetch(`${API_URL}/auctions/property/${propertyId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch auctions: ${response.status}`);
            }

            const data = await response.json();

            // Filter chỉ lấy ACTIVE và PENDING auctions
            return data.filter((auction: any) =>
                auction.status === 'ACTIVE' || auction.status === 'PENDING'
            );
        } catch (error) {
            console.error('Error fetching auctions:', error);
            throw error;
        }
    }
};