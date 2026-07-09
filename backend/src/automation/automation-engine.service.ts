import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { WorkflowExecutionsService } from '../workflow-executions/workflow-executions.service';

@Injectable()
export class AutomationEngineService {
  private readonly logger = new Logger(AutomationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly workflowExecutions: WorkflowExecutionsService,
  ) {}

  /**
   * Evaluates and executes a DB-backed workflow definition.
   */
  async executeWorkflow(workflowId: string, leadId: string) {
    this.logger.log(`Executing Workflow ${workflowId} for Lead ${leadId}`);
    
    // 1. Fetch Workflow from DB
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow || workflow.status !== 'ACTIVE') return;

    // 2. Start Execution Tracking
    const execution = await this.workflowExecutions.startExecution(workflowId, leadId);
    
    try {
      const definition = workflow.definition as any;
      const nodes = definition.nodes || [];
      const edges = definition.edges || [];

      // Find the Trigger node
      const triggerNode = nodes.find(n => n.type === 'triggerNode');
      if (!triggerNode) throw new Error('No trigger node found');

      const nodeResults = {};
      let currentNodeId = triggerNode.id;

      // Extremely basic engine loop
      while (currentNodeId) {
        const node = nodes.find(n => n.id === currentNodeId);
        if (!node) break;

        this.logger.debug(`Executing Node: ${node.type} (${node.data.label})`);
        
        // --- Execute Node Logic ---
        if (node.type === 'aiDecisionNode') {
          // AI Routing logic
          const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
          if (!lead) throw new Error(`Lead ${leadId} not found`);
          const decision = lead.score > 80 ? 'true' : 'false';
          nodeResults[node.id] = { status: 'success', decision };
          
          // Find next node based on decision branch
          const edge = edges.find(e => e.source === node.id && e.sourceHandle === decision);
          currentNodeId = edge ? edge.target : null;
          continue;
        }

        if (node.type === 'actionNode') {
          nodeResults[node.id] = { status: 'success', action: node.data.label };
          // Simulate action delay
          await new Promise(r => setTimeout(r, 500));
        }

        // --- Find Next Node ---
        const nextEdge = edges.find(e => e.source === node.id);
        currentNodeId = nextEdge ? nextEdge.target : null;
      }

      // Mark execution completed
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: { status: 'completed', nodeResults, completedAt: new Date() },
      });

    } catch (error) {
      this.logger.error(`Workflow ${workflowId} failed: ${error.message}`);
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: { status: 'failed', completedAt: new Date() },
      });
    }
  }

  /**
   * Generates suggested automation workflows using Gemini AI
   */
  async suggestWorkflows(industry: string, goal: string) {
    const context = `Industry: ${industry}, Goal: ${goal}`;
    try {
      return await this.aiService.suggestWorkflows(context);
    } catch (e) {
      this.logger.error('Failed to generate AI workflow suggestions', e);
      throw e;
    }
  }
}
