output "eks_cluster_name" {
  value       = aws_eks_cluster.ventureflow.name
  description = "EKS cluster name"
}

output "eks_cluster_arn" {
  value       = aws_eks_cluster.ventureflow.arn
  description = "EKS cluster ARN"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.ventureflow.endpoint
  description = "EKS cluster endpoint"
}

output "eks_cluster_version" {
  value       = aws_eks_cluster.ventureflow.version
  description = "EKS cluster version"
}

output "vpc_id" {
  value       = aws_vpc.ventureflow.id
  description = "VPC ID"
}

output "vpc_cidr" {
  value       = aws_vpc.ventureflow.cidr_block
  description = "VPC CIDR block"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "Private subnet IDs"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "Public subnet IDs"
}

output "db_instance_address" {
  value       = aws_db_instance.ventureflow.address
  description = "Database instance address"
  sensitive   = true
}

output "db_instance_port" {
  value       = aws_db_instance.ventureflow.port
  description = "Database instance port"
}

output "redis_endpoint" {
  value       = try(aws_elasticache_cluster.ventureflow.cluster_nodes[0].address, "")
  description = "Redis endpoint"
  sensitive   = true
}

output "opensearch_endpoint" {
  value       = try(aws_opensearchserverless_collection.ventureflow.collection_endpoint, "")
  description = "OpenSearch endpoint"
  sensitive   = true
}

output "worker_security_group_id" {
  value       = aws_security_group.worker.id
  description = "Worker node security group ID"
}

output "cluster_security_group_id" {
  value       = aws_security_group.cluster.id
  description = "EKS cluster security group ID"
}

output "configure_kubectl" {
  value       = "aws eks update-kubeconfig --name ${aws_eks_cluster.ventureflow.name} --region ${var.aws_region}"
  description = "Configure kubectl command"
}
