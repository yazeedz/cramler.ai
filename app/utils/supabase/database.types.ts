export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brand_competitors: {
        Row: {
          brand_id: string
          competitor_name: string
          competitor_type: string | null
          created_at: string | null
          id: string
          notes: string | null
          website: string | null
          description: string | null
          similarity_reason: string | null
          logo_url: string | null
        }
        Insert: {
          brand_id: string
          competitor_name: string
          competitor_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          website?: string | null
          description?: string | null
          similarity_reason?: string | null
          logo_url?: string | null
        }
        Update: {
          brand_id?: string
          competitor_name?: string
          competitor_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          website?: string | null
          description?: string | null
          similarity_reason?: string | null
          logo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_research_prompts: {
        Row: {
          average_position: number | null
          brand_id: string
          citation_share: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          prompt_text: string
          sort_order: number | null
          topic_id: string
          updated_at: string | null
          visibility_rank: number | null
          visibility_score: number | null
        }
        Insert: {
          average_position?: number | null
          brand_id: string
          citation_share?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          prompt_text: string
          sort_order?: number | null
          topic_id: string
          updated_at?: string | null
          visibility_rank?: number | null
          visibility_score?: number | null
        }
        Update: {
          average_position?: number | null
          brand_id?: string
          citation_share?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          prompt_text?: string
          sort_order?: number | null
          topic_id?: string
          updated_at?: string | null
          visibility_rank?: number | null
          visibility_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_research_prompts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_research_prompts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "brand_research_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_research_topics: {
        Row: {
          brand_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          prompt_count: number | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prompt_count?: number | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prompt_count?: number | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_research_topics_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_brand_visibility_reports: {
        Row: {
          id: string
          competitor_id: string
          brand_id: string
          report_date: string
          report_period: string | null
          overall_visibility_score: number | null
          visibility_change: number | null
          chatgpt_score: number | null
          claude_score: number | null
          gemini_score: number | null
          perplexity_score: number | null
          copilot_score: number | null
          total_mentions: number | null
          mentions_change: number | null
          first_choice_rate: number | null
          recommendation_rate: number | null
          share_of_voice: number | null
          positive_mentions: number | null
          neutral_mentions: number | null
          negative_mentions: number | null
          avg_sentiment_score: number | null
          competitive_rank: number | null
          generated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          competitor_id: string
          brand_id: string
          report_date: string
          report_period?: string | null
          overall_visibility_score?: number | null
          visibility_change?: number | null
          chatgpt_score?: number | null
          claude_score?: number | null
          gemini_score?: number | null
          perplexity_score?: number | null
          copilot_score?: number | null
          total_mentions?: number | null
          mentions_change?: number | null
          first_choice_rate?: number | null
          recommendation_rate?: number | null
          share_of_voice?: number | null
          positive_mentions?: number | null
          neutral_mentions?: number | null
          negative_mentions?: number | null
          avg_sentiment_score?: number | null
          competitive_rank?: number | null
          generated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          competitor_id?: string
          brand_id?: string
          report_date?: string
          report_period?: string | null
          overall_visibility_score?: number | null
          visibility_change?: number | null
          chatgpt_score?: number | null
          claude_score?: number | null
          gemini_score?: number | null
          perplexity_score?: number | null
          copilot_score?: number | null
          total_mentions?: number | null
          mentions_change?: number | null
          first_choice_rate?: number | null
          recommendation_rate?: number | null
          share_of_voice?: number | null
          positive_mentions?: number | null
          neutral_mentions?: number | null
          negative_mentions?: number | null
          avg_sentiment_score?: number | null
          competitive_rank?: number | null
          generated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_brand_visibility_reports_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "brand_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_brand_visibility_reports_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_visibility_reports: {
        Row: {
          avg_sentiment_score: number | null
          brand_id: string
          chatgpt_score: number | null
          claude_score: number | null
          competitive_rank: number | null
          copilot_score: number | null
          first_choice_rate: number | null
          gemini_score: number | null
          generated_at: string | null
          id: string
          mentions_change: number | null
          negative_mentions: number | null
          neutral_mentions: number | null
          overall_visibility_score: number | null
          perplexity_score: number | null
          positive_mentions: number | null
          recommendation_rate: number | null
          report_date: string
          report_period: string | null
          sample_queries: Json | null
          sample_responses: Json | null
          share_of_voice: number | null
          top_strengths: Json | null
          top_weaknesses: Json | null
          total_mentions: number | null
          visibility_change: number | null
        }
        Insert: {
          avg_sentiment_score?: number | null
          brand_id: string
          chatgpt_score?: number | null
          claude_score?: number | null
          competitive_rank?: number | null
          copilot_score?: number | null
          first_choice_rate?: number | null
          gemini_score?: number | null
          generated_at?: string | null
          id?: string
          mentions_change?: number | null
          negative_mentions?: number | null
          neutral_mentions?: number | null
          overall_visibility_score?: number | null
          perplexity_score?: number | null
          positive_mentions?: number | null
          recommendation_rate?: number | null
          report_date: string
          report_period?: string | null
          sample_queries?: Json | null
          sample_responses?: Json | null
          share_of_voice?: number | null
          top_strengths?: Json | null
          top_weaknesses?: Json | null
          total_mentions?: number | null
          visibility_change?: number | null
        }
        Update: {
          avg_sentiment_score?: number | null
          brand_id?: string
          chatgpt_score?: number | null
          claude_score?: number | null
          competitive_rank?: number | null
          copilot_score?: number | null
          first_choice_rate?: number | null
          gemini_score?: number | null
          generated_at?: string | null
          id?: string
          mentions_change?: number | null
          negative_mentions?: number | null
          neutral_mentions?: number | null
          overall_visibility_score?: number | null
          perplexity_score?: number | null
          positive_mentions?: number | null
          recommendation_rate?: number | null
          report_date?: string
          report_period?: string | null
          sample_queries?: Json | null
          sample_responses?: Json | null
          share_of_voice?: number | null
          top_strengths?: Json | null
          top_weaknesses?: Json | null
          total_mentions?: number | null
          visibility_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_visibility_reports_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          headquarters: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          market_position: string | null
          name: string
          organization_id: string
          slug: string
          track_competitors: boolean | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market_position?: string | null
          name: string
          organization_id: string
          slug: string
          track_competitors?: boolean | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market_position?: string | null
          name?: string
          organization_id?: string
          slug?: string
          track_competitors?: boolean | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          current_brand_id: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          current_brand_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          current_brand_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_current_brand_id_fkey"
            columns: ["current_brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      product_competitors: {
        Row: {
          competitor_brand: string | null
          competitor_product: string
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
        }
        Insert: {
          competitor_brand?: string | null
          competitor_product: string
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
        }
        Update: {
          competitor_brand?: string | null
          competitor_product?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_competitors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_visibility_reports: {
        Row: {
          attributes_mentioned: Json | null
          category_rank: number | null
          chatgpt_mentions: number | null
          chatgpt_score: number | null
          claude_mentions: number | null
          claude_score: number | null
          competitor_comparisons: Json | null
          copilot_mentions: number | null
          copilot_score: number | null
          gemini_mentions: number | null
          gemini_score: number | null
          generated_at: string | null
          id: string
          mentions_as_comparison: number | null
          mentions_as_example: number | null
          mentions_as_recommendation: number | null
          mentions_as_warning: number | null
          negative_attributes: Json | null
          overall_visibility_score: number | null
          perplexity_mentions: number | null
          perplexity_score: number | null
          positive_attributes: Json | null
          product_id: string
          query_categories: Json | null
          rank_change: number | null
          report_date: string
          report_period: string | null
          sample_responses: Json | null
          sentiment_breakdown: Json | null
          sentiment_score: number | null
          top_triggering_queries: Json | null
          total_mentions: number | null
          visibility_change: number | null
        }
        Insert: {
          attributes_mentioned?: Json | null
          category_rank?: number | null
          chatgpt_mentions?: number | null
          chatgpt_score?: number | null
          claude_mentions?: number | null
          claude_score?: number | null
          competitor_comparisons?: Json | null
          copilot_mentions?: number | null
          copilot_score?: number | null
          gemini_mentions?: number | null
          gemini_score?: number | null
          generated_at?: string | null
          id?: string
          mentions_as_comparison?: number | null
          mentions_as_example?: number | null
          mentions_as_recommendation?: number | null
          mentions_as_warning?: number | null
          negative_attributes?: Json | null
          overall_visibility_score?: number | null
          perplexity_mentions?: number | null
          perplexity_score?: number | null
          positive_attributes?: Json | null
          product_id: string
          query_categories?: Json | null
          rank_change?: number | null
          report_date: string
          report_period?: string | null
          sample_responses?: Json | null
          sentiment_breakdown?: Json | null
          sentiment_score?: number | null
          top_triggering_queries?: Json | null
          total_mentions?: number | null
          visibility_change?: number | null
        }
        Update: {
          attributes_mentioned?: Json | null
          category_rank?: number | null
          chatgpt_mentions?: number | null
          chatgpt_score?: number | null
          claude_mentions?: number | null
          claude_score?: number | null
          competitor_comparisons?: Json | null
          copilot_mentions?: number | null
          copilot_score?: number | null
          gemini_mentions?: number | null
          gemini_score?: number | null
          generated_at?: string | null
          id?: string
          mentions_as_comparison?: number | null
          mentions_as_example?: number | null
          mentions_as_recommendation?: number | null
          mentions_as_warning?: number | null
          negative_attributes?: Json | null
          overall_visibility_score?: number | null
          perplexity_mentions?: number | null
          perplexity_score?: number | null
          positive_attributes?: Json | null
          product_id?: string
          query_categories?: Json | null
          rank_change?: number | null
          report_date?: string
          report_period?: string | null
          sample_responses?: Json | null
          sentiment_breakdown?: Json | null
          sentiment_score?: number | null
          top_triggering_queries?: Json | null
          total_mentions?: number | null
          visibility_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_visibility_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          brand_id: string | null
          category: string | null
          claims: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_active: boolean | null
          main_category: string | null
          main_difference: string | null
          name: string
          price: string | null
          product_type: string | null
          product_url: string | null
          sku: string | null
          slug: string | null
          sources: Json | null
          status: string | null
          sub_category: string | null
          target_audience: string | null
          updated_at: string | null
          user_id: string
          what_it_does: string | null
        }
        Insert: {
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          claims?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          main_category?: string | null
          main_difference?: string | null
          name: string
          price?: string | null
          product_type?: string | null
          product_url?: string | null
          sku?: string | null
          slug?: string | null
          sources?: Json | null
          status?: string | null
          sub_category?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
          what_it_does?: string | null
        }
        Update: {
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          claims?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          main_category?: string | null
          main_difference?: string | null
          name?: string
          price?: string | null
          product_type?: string | null
          product_url?: string | null
          sku?: string | null
          slug?: string | null
          sources?: Json | null
          status?: string | null
          sub_category?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
          what_it_does?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_queries: {
        Row: {
          ai_model: string | null
          ai_platform: string
          brand_id: string | null
          competitors_mentioned: string[] | null
          id: string
          mention_position: number | null
          mention_type: string | null
          product_id: string | null
          product_mentioned: boolean | null
          queried_at: string | null
          query_category: string | null
          query_text: string
          response_text: string | null
          response_tokens: number | null
          sentiment: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_platform: string
          brand_id?: string | null
          competitors_mentioned?: string[] | null
          id?: string
          mention_position?: number | null
          mention_type?: string | null
          product_id?: string | null
          product_mentioned?: boolean | null
          queried_at?: string | null
          query_category?: string | null
          query_text: string
          response_text?: string | null
          response_tokens?: number | null
          sentiment?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_platform?: string
          brand_id?: string | null
          competitors_mentioned?: string[] | null
          id?: string
          mention_position?: number | null
          mention_type?: string | null
          product_id?: string | null
          product_mentioned?: boolean | null
          queried_at?: string | null
          query_category?: string | null
          query_text?: string
          response_text?: string | null
          response_tokens?: number | null
          sentiment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_queries_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_queries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_recommendations: {
        Row: {
          assigned_to: string | null
          brand_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string
          effort_level: string | null
          expected_impact: string | null
          id: string
          priority: string | null
          product_id: string | null
          rationale: string | null
          recommendation_type: string
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          effort_level?: string | null
          expected_impact?: string | null
          id?: string
          priority?: string | null
          product_id?: string | null
          rationale?: string | null
          recommendation_type: string
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          effort_level?: string | null
          expected_impact?: string | null
          id?: string
          priority?: string | null
          product_id?: string | null
          rationale?: string | null
          recommendation_type?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "visibility_recommendations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visibility_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_brand_ids: { Args: never; Returns: string[] }
      get_user_org_ids: { Args: never; Returns: string[] }
      get_user_product_ids: { Args: never; Returns: string[] }
      update_product_from_workflow: {
        Args: {
          p_brand?: string
          p_claims?: string[]
          p_description?: string
          p_image_url?: string
          p_ingredients?: string[]
          p_main_category?: string
          p_main_difference?: string
          p_name?: string
          p_price?: string
          p_product_id: string
          p_product_type?: string
          p_status?: string
          p_sub_category?: string
          p_target_audience?: string
          p_what_it_does?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
