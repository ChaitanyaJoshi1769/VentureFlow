terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }

  backend "s3" {
    bucket         = "ventureflow-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "VentureFlow"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

provider "kubernetes" {
  host                   = aws_eks_cluster.ventureflow.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.ventureflow.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.ventureflow.token
}

provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.ventureflow.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.ventureflow.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.ventureflow.token
  }
}

data "aws_eks_cluster_auth" "ventureflow" {
  name = aws_eks_cluster.ventureflow.name
}

data "aws_availability_zones" "available" {
  state = "available"
}
