import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folderPath = formData.get('folderPath') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!folderPath) {
      return NextResponse.json(
        { error: 'No folder path provided' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Supabase URL not configured' },
        { status: 500 }
      )
    }

    // Use service role key if available, otherwise fallback to anon key
    const supabaseKey = supabaseServiceKey && supabaseServiceKey !== 'your_service_role_key_here' 
      ? supabaseServiceKey 
      : supabaseAnonKey

    if (!supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase keys not configured. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const imageUrls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('ecommerce-assets')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        // If bucket doesn't exist or permission error, return helpful message
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          return NextResponse.json(
            { error: 'Storage bucket "ecommerce-assets" not found. Please create it in Supabase Dashboard > Storage.' },
            { status: 500 }
          )
        }
        if (uploadError.message?.includes('new row violates row-level security') || 
            uploadError.message?.includes('permission denied') ||
            uploadError.message?.includes('Permission denied') ||
            uploadError.message?.includes('Row Level Security')) {
          return NextResponse.json(
            { 
              error: 'Permission denied. Please setup storage policies.',
              details: 'Run SQL from SUPABASE_STORAGE_POLICIES.sql in Supabase SQL Editor, or see SETUP_STORAGE.md for step-by-step instructions.'
            },
            { status: 500 }
          )
        }
        return NextResponse.json(
          { 
            error: `Failed to upload image: ${uploadError.message}`,
            details: 'Check SETUP_STORAGE.md for troubleshooting'
          },
          { status: 500 }
        )
      }

      const { data: urlData } = supabase.storage
        .from('ecommerce-assets')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        imageUrls.push(urlData.publicUrl)
      }
    }

    return NextResponse.json({ urls: imageUrls })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    )
  }
}

