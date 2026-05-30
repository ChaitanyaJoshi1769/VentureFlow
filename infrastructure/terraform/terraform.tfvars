aws_region         = "us-east-1"
environment        = "production"
cluster_name       = "ventureflow-eks"
cluster_version    = "1.28"

# VPC Configuration
vpc_cidr             = "10.0.0.0/16"
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# EKS Node Configuration
instance_types = ["t3.large", "t3.xlarge"]
desired_size   = 3
min_size       = 2
max_size       = 10

# RDS Configuration
db_engine_version          = "16.0"
db_instance_class          = "db.r6g.xlarge"
db_allocated_storage       = 100
db_backup_retention_period = 30

# ElastiCache Redis Configuration
redis_engine_version = "7.0"
redis_node_type      = "cache.r7g.xlarge"

# OpenSearch Configuration
opensearch_version       = "2.9"
opensearch_instance_type = "r6g.xlarge.opensearch"
opensearch_ebs_size      = 100

# Monitoring and Logging
enable_monitoring = true
enable_logging    = true

tags = {
  Product    = "VentureFlow AI"
  Company    = "VentureFlow"
  CostCenter = "Engineering"
  Environment = "production"
}
