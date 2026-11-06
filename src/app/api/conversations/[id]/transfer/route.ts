import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { targetAgent, targetDepartment, transferNote } = body;

    if (!targetDepartment) {
      return NextResponse.json({ error: 'targetDepartment is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      conversationId: id,
      transferredTo: {
        agent: targetAgent || 'Unassigned',
        department: targetDepartment,
      },
      transferNote: transferNote || 'Transferred by agent',
      message: `Conversation transferred to ${targetDepartment}${targetAgent ? ` (${targetAgent})` : ''}.`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Transfer failed' }, { status: 500 });
  }
}
