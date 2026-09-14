export const tracks = [
  {
    id: 'aws-saa', provider: 'AWS', level: 'Associate', title: 'Solutions Architect', code: 'SAA-C03',
    description: 'Design resilient, secure and cost-aware AWS architectures.', domains: ['Secure Architectures', 'Resilient Architectures', 'High-Performing Architectures', 'Cost Optimization']
  },
  {
    id: 'aws-dev', provider: 'AWS', level: 'Associate', title: 'Developer', code: 'DVA-C02',
    description: 'Build, deploy and troubleshoot cloud-native AWS applications.', domains: ['Development', 'Security', 'Deployment', 'Troubleshooting']
  },
  {
    id: 'azure-ai', provider: 'Azure', level: 'Associate', title: 'Azure AI Engineer', code: 'AI-102',
    description: 'Build generative AI, vision, language and search solutions on Azure.', domains: ['Plan and Manage', 'Generative AI', 'NLP', 'Vision', 'Knowledge Mining']
  },
  {
    id: 'github-foundations', provider: 'GitHub', level: 'Foundational', title: 'GitHub Foundations', code: 'GH-900',
    description: 'Version control, collaboration, project management and modern GitHub workflows.', domains: ['Git', 'Repositories', 'Collaboration', 'Project Management']
  },
  {
    id: 'claude-architect', provider: 'Anthropic', level: 'Professional', title: 'Claude Solution Architect', code: 'ACADEMY-BETA',
    description: 'Prompting, tool use, retrieval, evaluation and production agent architecture.', domains: ['Prompting', 'Tool Use', 'RAG', 'Evaluation']
  }
];

export const questions = [
  { id: 'q1', domain: 'Secure Architectures', prompt: 'A company needs private access from VPC workloads to objects in S3 without traversing the public internet. What is the best option?', options: ['NAT gateway', 'S3 gateway endpoint', 'Internet gateway', 'Transit Gateway'], answer: 1, explanation: 'An S3 gateway VPC endpoint provides private routing to S3 without NAT or public internet connectivity.' },
  { id: 'q2', domain: 'Resilient Architectures', prompt: 'A stateless web tier must survive an Availability Zone failure. Which design is most appropriate?', options: ['One large EC2 instance', 'Auto Scaling group across multiple AZs behind an ALB', 'EC2 in one AZ plus an Elastic IP', 'Spot Fleet in a single subnet'], answer: 1, explanation: 'Spreading an Auto Scaling group across AZs behind an ALB removes the single-AZ failure domain.' },
  { id: 'q3', domain: 'High-Performing Architectures', prompt: 'An application serves frequently accessed small objects globally. Which service most directly reduces end-user latency?', options: ['AWS CloudTrail', 'Amazon CloudFront', 'AWS Config', 'AWS Backup'], answer: 1, explanation: 'CloudFront caches content at edge locations close to viewers.' },
  { id: 'q4', domain: 'Cost Optimization', prompt: 'A predictable EC2 workload will run continuously for three years. Which pricing choice generally offers the strongest commitment-based discount?', options: ['On-Demand', 'Spot only', 'Compute Savings Plan commitment', 'Dedicated Hosts with no commitment'], answer: 2, explanation: 'Savings Plans exchange a usage commitment for substantial discounts versus On-Demand pricing.' },
  { id: 'q5', domain: 'Secure Architectures', prompt: 'Which IAM approach best follows least privilege for an application running on EC2?', options: ['Store root keys in user data', 'Attach an instance role with only required actions', 'Create one shared admin user', 'Make the S3 bucket public'], answer: 1, explanation: 'An instance role provides temporary credentials and can be scoped to the exact required permissions.' },
  { id: 'q6', domain: 'Resilient Architectures', prompt: 'Which managed database feature provides automatic synchronous replication across Availability Zones for high availability?', options: ['RDS Multi-AZ', 'RDS Read Replica only', 'DynamoDB DAX', 'ElastiCache'], answer: 0, explanation: 'RDS Multi-AZ maintains a synchronous standby and automates failover.' },
  { id: 'q7', domain: 'High-Performing Architectures', prompt: 'A workload requires a durable queue to decouple producers and consumers. Which AWS service fits best?', options: ['SQS', 'Route 53', 'CloudFormation', 'Inspector'], answer: 0, explanation: 'SQS is a managed durable message queue designed for decoupling distributed components.' },
  { id: 'q8', domain: 'Cost Optimization', prompt: 'Which S3 feature can automatically move older objects to lower-cost storage classes?', options: ['Lifecycle rules', 'Bucket ACLs', 'Transfer Acceleration', 'Object Lock'], answer: 0, explanation: 'Lifecycle rules transition or expire objects based on age and other criteria.' }
];

export const blitzCards = [
  { prompt: 'Private S3 access from a VPC?', options: ['Gateway endpoint', 'NAT only', 'Direct Connect only', 'Internet gateway'], answer: 0 },
  { prompt: 'Global CDN service?', options: ['CloudFront', 'CloudTrail', 'CloudWatch Logs', 'Config'], answer: 0 },
  { prompt: 'Durable managed queue?', options: ['SQS', 'SNS topic only', 'Route 53', 'KMS'], answer: 0 },
  { prompt: 'Automatic RDS standby failover?', options: ['Multi-AZ', 'Read Replica', 'DAX', 'Global Accelerator'], answer: 0 },
  { prompt: 'Temporary AWS credentials for EC2?', options: ['Instance role', 'Root access key', 'Shared IAM user', 'Public bucket'], answer: 0 },
  { prompt: 'Infrastructure as code on AWS?', options: ['CloudFormation', 'GuardDuty', 'Macie', 'Shield'], answer: 0 }
];

export const scenarios = [
  {
    id: 'serverless-api',
    title: 'Highly available serverless API',
    brief: 'Build a public API that runs business logic without servers and stores low-latency key-value data. Static assets should be distributed globally.',
    palette: ['Route 53', 'CloudFront', 'S3', 'API Gateway', 'Lambda', 'DynamoDB', 'RDS', 'EC2', 'SQS'],
    requiredServices: ['CloudFront', 'S3', 'API Gateway', 'Lambda', 'DynamoDB'],
    requiredEdges: [
      { from: 'CloudFront', to: 'S3' },
      { from: 'API Gateway', to: 'Lambda' },
      { from: 'Lambda', to: 'DynamoDB' }
    ]
  }
];
