resource "aws_elasticache_subnet_group" "ventureflow" {
  name       = "${var.cluster_name}-cache-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.cluster_name}-cache-subnet-group"
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.cluster_name}-redis-"
  vpc_id      = aws_vpc.ventureflow.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.worker.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-redis-sg"
  }
}

resource "random_password" "redis_password" {
  length  = 32
  special = true
}

resource "aws_elasticache_cluster" "ventureflow" {
  cluster_id           = "${var.cluster_name}-redis"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 3
  engine_version       = var.redis_engine_version
  port                 = 6379
  parameter_group_name = "default.redis7"

  subnet_group_name       = aws_elasticache_subnet_group.ventureflow.name
  security_group_ids      = [aws_security_group.redis.id]

  automatic_failover_enabled = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = random_password.redis_password.result

  maintenance_window = "mon:03:00-mon:04:00"
  notification_topic_arn = ""

  tags = {
    Name = "${var.cluster_name}-redis"
  }
}

resource "aws_ssm_parameter" "redis_password" {
  name  = "/${var.cluster_name}/redis/password"
  type  = "SecureString"
  value = random_password.redis_password.result

  tags = {
    Name = "${var.cluster_name}-redis-password"
  }
}

resource "aws_ssm_parameter" "redis_endpoint" {
  name  = "/${var.cluster_name}/redis/endpoint"
  type  = "String"
  value = aws_elasticache_cluster.ventureflow.cluster_nodes[0].address

  tags = {
    Name = "${var.cluster_name}-redis-endpoint"
  }
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.ventureflow.cluster_nodes[0].address
  description = "Redis endpoint"
}

output "redis_port" {
  value       = aws_elasticache_cluster.ventureflow.port
  description = "Redis port"
}
