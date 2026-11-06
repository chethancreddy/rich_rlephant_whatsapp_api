// ============================================================================
// Automation Flow Simulator & Execution API
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { AutomationEngine, AutomationFlowDefinition, ExecutionContext } from '@/lib/services/automation-engine';

const engine = new AutomationEngine();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flow, context } = body;

    if (!flow || !context) {
      return NextResponse.json(
        { error: 'flow and context objects are required' },
        { status: 400 }
      );
    }

    const result = engine.executeFlow(
      flow as AutomationFlowDefinition,
      context as ExecutionContext
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to execute flow' },
      { status: 500 }
    );
  }
}

