resource "aws_security_group" "opensearch" {
  name_prefix = "${var.cluster_name}-opensearch-"
  vpc_id      = aws_vpc.ventureflow.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.worker.id]
  }

  ingress {
    from_port       = 9200
    to_port         = 9200
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
    Name = "${var.cluster_name}-opensearch-sg"
  }
}

resource "aws_opensearchserverless_security_policy" "ventureflow" {
  name            = "${var.cluster_name}-security-policy"
  type            = "encryption"
  policy          = jsonencode({
    Rules = [
      {
        ResourceType = "collection"
        Resource     = ["collection/${var.cluster_name}-*"]
      }
    ]
    AWSOwnedKey = true
  })
}

resource "aws_opensearchserverless_encryption_policy" "ventureflow" {
  name            = "${var.cluster_name}-encryption-policy"
  type            = "encryption"
  policy          = jsonencode({
    Rules = [
      {
        ResourceType = "collection"
        Resource     = ["collection/${var.cluster_name}-*"]
      }
    ]
    AWSOwnedKey = true
  })
}

resource "aws_opensearchserverless_collection" "ventureflow" {
  name       = "${var.cluster_name}-collection"
  type       = "SEARCH"
  description = "VentureFlow search collection"

  depends_on = [
    aws_opensearchserverless_security_policy.ventureflow,
    aws_opensearchserverless_encryption_policy.ventureflow
  ]

  tags = {
    Name = "${var.cluster_name}-opensearch"
  }
}

resource "aws_opensearchserverless_access_policy" "ventureflow" {
  name            = "${var.cluster_name}-access-policy"
  type            = "data"
  policy          = jsonencode([
    {
      Rules = [
        {
          ResourceType = "collection"
          Resource     = ["collection/${var.cluster_name}-*"]
          Permission = [
            "aoss:CreateCollectionItems",
            "aoss:DeleteCollectionItems",
            "aoss:UpdateCollectionItems",
            "aoss:DescribeCollectionItems",
            "aoss:GetCollectionItems",
            "aoss:CreateIndex",
            "aoss:DeleteIndex",
            "aoss:DescribeIndex",
            "aoss:UpdateIndex",
            "aoss:WriteAccessPolicy",
            "aoss:ReadAccessPolicy"
          ]
        },
        {
          ResourceType = "index"
          Resource     = ["index/${var.cluster_name}-*/*"]
          Permission = [
            "aoss:CreateCollectionItems",
            "aoss:DeleteCollectionItems",
            "aoss:UpdateCollectionItems",
            "aoss:DescribeCollectionItems",
            "aoss:GetCollectionItems"
          ]
        }
      ]
      Principal = ["*"]
      Effect    = "Allow"
    }
  ])
}

output "opensearch_endpoint" {
  value       = aws_opensearchserverless_collection.ventureflow.collection_endpoint
  description = "OpenSearch endpoint"
}

output "opensearch_arn" {
  value       = aws_opensearchserverless_collection.ventureflow.arn
  description = "OpenSearch ARN"
}
