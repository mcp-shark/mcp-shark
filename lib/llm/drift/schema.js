import { z } from 'zod';

/**
 * Zod schema for LLM analysis output
 * Enforces strict JSON structure for security analysis
 */
export const LlmAnalysisSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('Overall risk level'),
  summary: z.string().max(500).describe('Brief summary of the analysis'),
  findings: z
    .array(
      z.object({
        type: z.enum(['added', 'removed', 'changed']).describe('Type of change'),
        toolName: z.string().describe('Name of the affected tool'),
        severity: z
          .enum(['low', 'medium', 'high', 'critical'])
          .describe('Severity of this finding'),
        description: z.string().max(500).describe('Description of the security concern'),
        recommendation: z.string().max(500).optional().describe('Recommended action'),
      })
    )
    .max(20)
    .describe('List of security findings'),
  confidence: z.number().min(0).max(1).describe('Confidence score (0-1)'),
});

/**
 * Validate LLM analysis JSON output
 * Returns { success: true, data } or { success: false, error }
 */
export function validateLlmAnalysis(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = LlmAnalysisSchema.parse(parsed);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Schema validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      };
    }
    return { success: false, error: `JSON parse error: ${error.message}` };
  }
}
