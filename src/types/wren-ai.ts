// WrenAI API Types
export interface WrenAIAskRequest {
  question: string;
  thread_id: string;
  instructions?: string[];
}

export interface WrenAIAskResponse {
  query_id: string;
  sql: string;
  summary: string;
  view_id?: string;
}

export interface WrenAIQueryDetails {
  query_id: string;
  data?: PropertyResult[];
  error?: string;
  sql?: string;
  summary?: string;
}

export interface PropertyResult {
  property_id: string;
  property_name: string;
  price_per_night: number;
  location: string;
  rating?: number;
  amenities?: string[];
  image_url?: string;
}

export interface ChatbotResponse {
  type: 'property_results' | 'error' | 'loading';
  message: string;
  properties?: FormattedProperty[];
  sql_query?: string;
}

export interface FormattedProperty {
  id: string;
  name: string;
  price: number;
  location: string;
  link: string;
  rating?: number;
  imageUrl?: string;
  amenities?: string[];
}

export interface WrenAIError {
  status: number;
  message: string;
  context?: string;
}