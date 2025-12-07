"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { User } from "@supabase/supabase-js"

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string | null
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  description?: string | null
  organization_id: string
}

export interface UserContext {
  user: User | null
  isLoading: boolean
  organizations: Organization[]
  brands: Brand[]
  currentOrganization: Organization | null
  currentBrand: Brand | null
  switchOrganization: (orgId: string) => Promise<void>
  switchBrand: (brandId: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useUserContext(): UserContext {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null)

  const supabase = createClient()

  const fetchContext = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setIsLoading(false)
        return
      }

      // Get user's organization memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          current_brand_id,
          role,
          organizations (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('user_id', user.id)

      if (membershipsError) {
        console.error('Failed to fetch memberships:', membershipsError)
        setIsLoading(false)
        return
      }

      // Extract organizations from memberships
      const orgs: Organization[] = (memberships || [])
        .map(m => m.organizations as unknown as Organization)
        .filter(Boolean)

      setOrganizations(orgs)

      // Determine current organization
      // Priority: 1) membership with current_brand_id, 2) first org
      let currentMembership = memberships?.find(m => m.current_brand_id) || memberships?.[0]
      let currentOrg = currentMembership?.organizations as unknown as Organization | null

      if (!currentOrg && orgs.length > 0) {
        currentOrg = orgs[0]
      }

      setCurrentOrganization(currentOrg)

      if (currentOrg) {
        // Fetch brands for current organization
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, name, slug, logo_url, description, organization_id')
          .eq('organization_id', currentOrg.id)
          .order('name')

        if (brandsError) {
          console.error('Failed to fetch brands:', brandsError)
        } else {
          setBrands(brandsData || [])

          // Determine current brand
          let currentBrandId = currentMembership?.current_brand_id
          let brand = brandsData?.find(b => b.id === currentBrandId) || brandsData?.[0] || null

          setCurrentBrand(brand)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user context:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  const switchOrganization = useCallback(async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (!org || !user) return

    setCurrentOrganization(org)

    // Fetch brands for the new organization
    const { data: brandsData } = await supabase
      .from('brands')
      .select('id, name, slug, logo_url, description, organization_id')
      .eq('organization_id', orgId)
      .order('name')

    setBrands(brandsData || [])

    // Set first brand as current
    const firstBrand = brandsData?.[0] || null
    setCurrentBrand(firstBrand)

    // Update the membership's current_brand_id
    if (firstBrand) {
      await supabase
        .from('organization_members')
        .update({ current_brand_id: firstBrand.id })
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
    }
  }, [organizations, user, supabase])

  const switchBrand = useCallback(async (brandId: string) => {
    const brand = brands.find(b => b.id === brandId)
    if (!brand || !user || !currentOrganization) return

    setCurrentBrand(brand)

    // Update the membership's current_brand_id
    await supabase
      .from('organization_members')
      .update({ current_brand_id: brandId })
      .eq('user_id', user.id)
      .eq('organization_id', currentOrganization.id)
  }, [brands, user, currentOrganization, supabase])

  return {
    user,
    isLoading,
    organizations,
    brands,
    currentOrganization,
    currentBrand,
    switchOrganization,
    switchBrand,
    refetch: fetchContext,
  }
}
