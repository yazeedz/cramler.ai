import { createClient } from "@/app/utils/supabase/server"

// Get brand by ID
export async function getBrand(brandId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .single()

  if (error) throw error
  return data
}

// Get latest brand visibility report
export async function getBrandVisibilityReport(brandId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("brand_visibility_reports")
    .select("*")
    .eq("brand_id", brandId)
    .order("report_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// Get products for a brand with visibility data
export async function getProductsForBrand(brandId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_visibility_reports (
        overall_visibility_score,
        category_rank,
        visibility_change,
        total_mentions
      )
    `)
    .eq("brand_id", brandId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Get top products by visibility score
export async function getTopProducts(brandId: string, limit: number = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_visibility_reports (
        overall_visibility_score,
        visibility_change,
        total_mentions,
        category_rank
      )
    `)
    .eq("brand_id", brandId)
    .eq("is_active", true)
    .limit(limit)

  if (error) throw error

  // Sort by visibility score (need to do this in JS since we're joining)
  return (data || []).sort((a, b) => {
    const scoreA = a.product_visibility_reports?.[0]?.overall_visibility_score || 0
    const scoreB = b.product_visibility_reports?.[0]?.overall_visibility_score || 0
    return scoreB - scoreA
  }).slice(0, limit)
}

// Get recent visibility recommendations
export async function getRecentInsights(brandId: string, limit: number = 3) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("visibility_recommendations")
    .select("*")
    .eq("brand_id", brandId)
    .eq("status", "pending")
    .order("priority", { ascending: true }) // high > medium > low
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Get brand competitors with share of voice data
export async function getTopCompetitors(brandId: string, limit: number = 4) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("brand_competitors")
    .select("*")
    .eq("brand_id", brandId)
    .order("share_of_voice", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Get single product with all details
export async function getProduct(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brands (id, name),
      product_competitors (*),
      product_visibility_reports (*)
    `)
    .eq("id", productId)
    .single()

  if (error) throw error
  return data
}

// Get product visibility report
export async function getProductVisibilityReport(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("product_visibility_reports")
    .select("*")
    .eq("product_id", productId)
    .order("report_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// Count products for a brand
export async function getProductCount(brandId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("brand_id", brandId)
    .eq("is_active", true)

  if (error) throw error
  return count || 0
}

// Get pending insights count
export async function getPendingInsightsCount(brandId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("visibility_recommendations")
    .select("*", { count: "exact", head: true })
    .eq("brand_id", brandId)
    .eq("status", "pending")

  if (error) throw error
  return count || 0
}
