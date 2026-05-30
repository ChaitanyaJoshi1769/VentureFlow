resource "aws_db_subnet_group" "ventureflow" {
  name       = "${var.cluster_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.cluster_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.cluster_name}-rds-"
  vpc_id      = aws_vpc.ventureflow.id

  ingress {
    from_port       = 5432
    to_port         = 5432
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
    Name = "${var.cluster_name}-rds-sg"
  }
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "aws_db_instance" "ventureflow" {
  identifier              = "${var.cluster_name}-postgres"
  engine                  = "postgres"
  engine_version          = var.db_engine_version
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  storage_encrypted       = true
  storage_type            = "gp3"
  iops                    = 3000

  db_name  = "ventureflow"
  username = "ventureflow"
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.ventureflow.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  multi_az               = true
  backup_retention_period = var.db_backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql"]
  enable_iam_database_authentication = true

  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier_prefix = "${var.cluster_name}-final-snapshot"

  tags = {
    Name = "${var.cluster_name}-postgres"
  }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.cluster_name}/db/password"
  type  = "SecureString"
  value = random_password.db_password.result

  tags = {
    Name = "${var.cluster_name}-db-password"
  }
}

output "rds_endpoint" {
  value       = aws_db_instance.ventureflow.endpoint
  description = "RDS endpoint"
}

output "rds_arn" {
  value       = aws_db_instance.ventureflow.arn
  description = "RDS ARN"
}
