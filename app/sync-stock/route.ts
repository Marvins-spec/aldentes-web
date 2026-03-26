export const runtime = 'nodejs'

import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // ✅ auth google
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    // ✅ connect sheet
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      serviceAccountAuth
    )

    await doc.loadInfo()

    const sheet = doc.sheetsByTitle['stock'] // 👈 ชื่อ sheet ต้องตรง
    const rows = await sheet.getRows()

    // ✅ loop update supabase
    for (const row of rows) {
      const name = row.get('name')
      const current = Number(row.get('current_stock'))
      const min = Number(row.get('min_stock') || 0)
      const unit = row.get('unit') || ''

      if (!name) continue

      const { error } = await supabase
        .from('stock')
        .upsert(
          {
            name: name,
            current_stock: current,
            min_stock: min,
            unit: unit
          },
          { onConflict: 'name' }
        )

      if (error) {
        console.error('UPSERT ERROR:', error)
        continue // 🔥 สำคัญ กัน loop พัง
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('SYNC ERROR:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
