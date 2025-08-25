import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Reeled AI API is running',
    version: '1.0.0'
  })
}

export async function POST() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Reeled AI API is running', 
    version: '1.0.0'
  })
} 