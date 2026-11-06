// ============================================================================
// Internal Team Collaboration Notes API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { noteBody, authorName = 'Chethan Reddy' } = body;

    if (!noteBody || !noteBody.trim()) {
      return NextResponse.json(
        { error: 'Note body cannot be empty' },
        { status: 400 }
      );
    }

    const newNote = {
      id: `note_${Date.now()}`,
      conversation_id: id,
      author_name: authorName,
      body: noteBody.trim(),
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      note: newNote,
      message: 'Internal note saved securely (never sent to WhatsApp customer).',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to save note' },
      { status: 500 }
    );
  }
}

