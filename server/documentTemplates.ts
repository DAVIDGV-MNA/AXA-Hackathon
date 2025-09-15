// === PENDING: Document Generation Templates ===
// TODO: Implement AI document generation templates
// Document template system for the Document Creator Agent
export interface DocumentTemplate {
  id: string;
  name: string;
  type: "politics" | "operations" | "manual";
  description: string;
  sections: DocumentSection[];
  promptTemplate: string;
}

export interface DocumentSection {
  title: string;
  description: string;
  required: boolean;
  placeholder: string;
}

// Predefined document templates
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "policy-standard",
    name: "Standard Policy Document",
    type: "politics",
    description: "A comprehensive policy document template with standard governance sections",
    sections: [
      {
        title: "Policy Statement",
        description: "Clear statement of the policy's purpose and scope",
        required: true,
        placeholder: "This policy establishes..."
      },
      {
        title: "Scope and Applicability", 
        description: "Who and what this policy applies to",
        required: true,
        placeholder: "This policy applies to all..."
      },
      {
        title: "Definitions",
        description: "Key terms and definitions used in the policy",
        required: false,
        placeholder: "For the purpose of this policy..."
      },
      {
        title: "Policy Guidelines",
        description: "Detailed guidelines and requirements",
        required: true,
        placeholder: "The following guidelines must be followed..."
      },
      {
        title: "Responsibilities",
        description: "Roles and responsibilities for implementation",
        required: true,
        placeholder: "Each party has the following responsibilities..."
      },
      {
        title: "Compliance and Monitoring",
        description: "How compliance will be monitored and enforced",
        required: true,
        placeholder: "Compliance with this policy will be monitored through..."
      },
      {
        title: "Review and Updates",
        description: "How and when the policy will be reviewed",
        required: true,
        placeholder: "This policy will be reviewed annually..."
      }
    ],
    promptTemplate: `Create a professional {{type}} policy document about "{{topic}}". 

Include the following sections in a well-structured format:
- Policy Statement: Clear purpose and objectives
- Scope and Applicability: Who this applies to and when
- Policy Guidelines: Detailed requirements and procedures
- Responsibilities: Roles and accountability
- Compliance and Monitoring: Enforcement and oversight
- Review and Updates: Maintenance schedule

Make the content comprehensive, professional, and actionable. Use clear headings and bullet points where appropriate.`
  },
  {
    id: "operational-procedure",
    name: "Operational Procedure",
    type: "operations", 
    description: "Step-by-step operational procedure template",
    sections: [
      {
        title: "Purpose",
        description: "Why this procedure exists",
        required: true,
        placeholder: "This procedure is designed to..."
      },
      {
        title: "Prerequisites",
        description: "What needs to be in place before starting",
        required: false,
        placeholder: "Before beginning this procedure..."
      },
      {
        title: "Step-by-Step Instructions",
        description: "Detailed procedural steps",
        required: true,
        placeholder: "Follow these steps in order..."
      },
      {
        title: "Quality Checks",
        description: "Verification and validation steps",
        required: true,
        placeholder: "Verify the following at each step..."
      },
      {
        title: "Troubleshooting",
        description: "Common issues and solutions",
        required: false,
        placeholder: "If you encounter issues..."
      },
      {
        title: "Documentation Requirements",
        description: "What must be documented",
        required: true,
        placeholder: "Document the following information..."
      }
    ],
    promptTemplate: `Create a detailed operational procedure for "{{topic}}". 

Structure it with these sections:
- Purpose: Clear objective of the procedure
- Prerequisites: Required conditions, tools, or permissions
- Step-by-Step Instructions: Numbered, detailed steps
- Quality Checks: Validation points throughout the process
- Troubleshooting: Common issues and solutions
- Documentation Requirements: What to record

Make it practical, easy to follow, and include safety considerations where relevant.`
  },
  {
    id: "user-manual",
    name: "User Manual/Guide", 
    type: "manual",
    description: "Comprehensive user manual template",
    sections: [
      {
        title: "Introduction",
        description: "Overview of what this manual covers",
        required: true,
        placeholder: "This manual provides guidance on..."
      },
      {
        title: "Getting Started",
        description: "Initial setup or first-time user instructions",
        required: true,
        placeholder: "To get started..."
      },
      {
        title: "Features and Functions",
        description: "Detailed explanation of capabilities",
        required: true,
        placeholder: "The system provides the following features..."
      },
      {
        title: "Step-by-Step Procedures",
        description: "How to perform common tasks",
        required: true,
        placeholder: "To perform this task..."
      },
      {
        title: "Best Practices",
        description: "Recommended approaches and tips",
        required: false,
        placeholder: "For optimal results..."
      },
      {
        title: "Troubleshooting and FAQ",
        description: "Common problems and solutions",
        required: true,
        placeholder: "Common questions and issues..."
      }
    ],
    promptTemplate: `Create a comprehensive user manual for "{{topic}}". 

Include these sections:
- Introduction: Overview and purpose
- Getting Started: Setup and first steps  
- Features and Functions: What the system can do
- Step-by-Step Procedures: How to perform key tasks
- Best Practices: Tips for effective use
- Troubleshooting and FAQ: Solutions to common problems

Write in clear, user-friendly language with examples where helpful.`
  },
  {
    id: "training-manual",
    name: "Training Manual",
    type: "manual",
    description: "Employee training and development manual",
    sections: [
      {
        title: "Learning Objectives",
        description: "What trainees will learn",
        required: true,
        placeholder: "By the end of this training..."
      },
      {
        title: "Prerequisites",
        description: "Required knowledge or experience",
        required: false,
        placeholder: "Trainees should have..."
      },
      {
        title: "Training Content",
        description: "Core learning materials",
        required: true,
        placeholder: "This section covers..."
      },
      {
        title: "Practical Exercises",
        description: "Hands-on activities and examples",
        required: true,
        placeholder: "Complete the following exercises..."
      },
      {
        title: "Assessment Criteria",
        description: "How proficiency will be measured",
        required: true,
        placeholder: "Competency will be evaluated on..."
      },
      {
        title: "Resources and References",
        description: "Additional materials for continued learning",
        required: false,
        placeholder: "For further information..."
      }
    ],
    promptTemplate: `Create a comprehensive training manual for "{{topic}}".

Structure it with:
- Learning Objectives: Clear goals for what trainees will achieve
- Prerequisites: Required background knowledge or skills
- Training Content: Organized learning modules and key concepts
- Practical Exercises: Hands-on activities to reinforce learning
- Assessment Criteria: How to measure competency and success
- Resources and References: Additional materials for ongoing development

Make it engaging, interactive, and focused on practical skill development.`
  }
];

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByType(type: "politics" | "operations" | "manual"): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(template => template.type === type);
}

export function generatePromptFromTemplate(template: DocumentTemplate, topic: string, type: string): string {
  return template.promptTemplate
    .replace(/\{\{topic\}\}/g, topic)
    .replace(/\{\{type\}\}/g, type);
}

// Enhanced prompt generation for document creator
export function createDocumentCreatorPrompt(userRequest: string, documentType?: string): string {
  // Extract key information from user request
  const isSpecificTemplate = userRequest.toLowerCase().includes('policy') || 
                             userRequest.toLowerCase().includes('procedure') || 
                             userRequest.toLowerCase().includes('manual') ||
                             userRequest.toLowerCase().includes('guide');
  
  if (isSpecificTemplate) {
    // Try to match to a template
    if (userRequest.toLowerCase().includes('policy')) {
      const template = getTemplateById('policy-standard');
      return generatePromptFromTemplate(template!, userRequest, documentType || 'policy');
    } else if (userRequest.toLowerCase().includes('procedure') || userRequest.toLowerCase().includes('process')) {
      const template = getTemplateById('operational-procedure');  
      return generatePromptFromTemplate(template!, userRequest, documentType || 'procedure');
    } else if (userRequest.toLowerCase().includes('manual') || userRequest.toLowerCase().includes('guide')) {
      const template = getTemplateById('user-manual');
      return generatePromptFromTemplate(template!, userRequest, documentType || 'manual');
    }
  }
  
  // Default enhanced prompt for general document creation
  return `Create a comprehensive, professional document based on this request: "${userRequest}"

Please structure your response with:
1. **Clear Document Title**
2. **Executive Summary or Introduction**
3. **Well-organized main content sections with descriptive headings**
4. **Actionable guidelines or procedures where applicable**
5. **Conclusion or next steps**

Make the document:
- Professional and authoritative in tone
- Well-structured with clear headings and subheadings
- Actionable with specific guidance where relevant
- Comprehensive but concise
- Formatted with markdown for readability

Focus on creating content that would be suitable for organizational use and could be saved as a reference document.`;
}