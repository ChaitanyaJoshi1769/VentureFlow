# VentureFlow AI - Production Deployment Guide

## Overview
This guide covers deploying VentureFlow AI to AWS using Kubernetes (EKS), Terraform for infrastructure, and Helm for package management.

## Prerequisites
- AWS Account with appropriate permissions
- Terraform >= 1.5.0
- kubectl >= 1.28
- Helm >= 3.12
- AWS CLI configured

## Architecture

```
┌─────────────────────────────────────────────────┐
│            AWS Account (us-east-1)              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ VPC (10.0.0.0/16)                       │   │
│  │                                         │   │
│  │ ┌──────────────┐  ┌──────────────┐    │   │
│  │ │ Public SN 1  │  │ Public SN 2  │    │   │
│  │ │ NAT GW       │  │ NAT GW       │    │   │
│  │ └──────────────┘  └──────────────┘    │   │
│  │         ↓              ↓               │   │
│  │ ┌────────────────────────────────┐    │   │
│  │ │ Internet Gateway               │    │   │
│  │ └────────────────────────────────┘    │   │
│  │         ↑              ↑               │   │
│  │ ┌──────────────┐  ┌──────────────┐    │   │
│  │ │ Private SN 1 │  │ Private SN 2 │    │   │
│  │ │ EKS Nodes    │  │ EKS Nodes    │    │   │
│  │ └──────────────┘  └──────────────┘    │   │
│  │                                         │   │
│  │ ┌────────────────────────────────┐    │   │
│  │ │ RDS PostgreSQL (Multi-AZ)      │    │   │
│  │ └────────────────────────────────┘    │   │
│  │                                         │   │
│  │ ┌────────────────────────────────┐    │   │
│  │ │ ElastiCache Redis (Cluster)    │    │   │
│  │ └────────────────────────────────┘    │   │
│  │                                         │   │
│  │ ┌────────────────────────────────┐    │   │
│  │ │ OpenSearch (Serverless)        │    │   │
│  │ └────────────────────────────────┘    │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Step 1: Initialize Terraform State

```bash
cd infrastructure/terraform

# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket ventureflow-terraform-state \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ventureflow-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

## Step 2: Deploy Infrastructure with Terraform

```bash
# Initialize Terraform
terraform init

# Format and validate configuration
terraform fmt
terraform validate

# Plan deployment
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan

# Save outputs
terraform output -json > outputs.json
```

## Step 3: Configure kubectl

```bash
# Get cluster configuration
aws eks update-kubeconfig \
  --name ventureflow-eks \
  --region us-east-1

# Verify connection
kubectl get nodes
kubectl get pods --all-namespaces
```

## Step 4: Deploy Kubernetes Resources

```bash
cd ../kubernetes

# Create namespace
kubectl apply -f namespace.yaml

# Create ConfigMaps and Secrets
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# Note: Update secrets.yaml with real credentials before applying

# Deploy database and caching
kubectl apply -f postgres-statefulset.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f elasticsearch-deployment.yaml

# Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n ventureflow --timeout=300s

# Run database migrations
kubectl apply -f db-migrations-job.yaml

# Deploy RBAC
kubectl apply -f rbac.yaml

# Deploy API
kubectl apply -f api-deployment.yaml
kubectl apply -f api-service.yaml

# Deploy Ingress
kubectl apply -f ingress.yaml
```

## Step 5: Install Add-ons with Helm

```bash
# Add Helm repositories
helm repo add stable https://charts.helm.sh/stable
helm repo add jetstack https://charts.jetstack.io
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install cert-manager
kubectl create namespace cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v1.13.0

# Install NGINX Ingress
kubectl create namespace ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --values helm-values/nginx-ingress.yaml

# Install Prometheus & Grafana
kubectl create namespace monitoring
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring

# Wait for load balancer IP
kubectl get svc -n ingress-nginx nginx-ingress-ingress-nginx-controller
```

## Step 6: Verify Deployment

```bash
# Check all resources
kubectl get all -n ventureflow

# Check API logs
kubectl logs -n ventureflow deployment/ventureflow-api

# Check database connectivity
kubectl exec -n ventureflow deployment/ventureflow-api -- \
  psql -h postgres-service -U ventureflow -d ventureflow -c "SELECT VERSION();"

# Test API endpoint
kubectl port-forward -n ventureflow svc/ventureflow-api 3000:80
curl http://localhost:3000/health
```

## Step 7: Configure DNS

Update your domain DNS records to point to the Load Balancer:

```bash
# Get Load Balancer endpoint
kubectl get svc -n ingress-nginx -o wide

# Create CNAME records:
# api.ventureflow.io -> <LB_ENDPOINT>
# ventureflow.io -> <LB_ENDPOINT>
# investor.ventureflow.io -> <LB_ENDPOINT>
```

## Monitoring & Observability

### Access Grafana
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Open http://localhost:3000
# Default credentials: admin / prom-operator
```

### Check Metrics
```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Open http://localhost:9090
```

## Scaling

### Scale EKS Nodes
```bash
# Update desired_size in terraform.tfvars
terraform apply
```

### Scale API Deployment
```bash
kubectl scale deployment ventureflow-api -n ventureflow --replicas=5
```

### Auto-scaling
```bash
# Install Cluster Autoscaler
helm install autoscaler autoscaling/cluster-autoscaler \
  --namespace kube-system \
  --set autoDiscovery.clusterName=ventureflow-eks

# Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Create HPA
kubectl apply -f hpa.yaml
```

## Disaster Recovery

### Backup Database
```bash
# Automated daily backups via RDS (30-day retention)
# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier ventureflow-postgres \
  --db-snapshot-identifier ventureflow-backup-$(date +%Y%m%d)
```

### Backup Kubernetes State
```bash
# Using Velero
helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --values helm-values/velero.yaml
```

## Cleanup

```bash
# Delete Kubernetes resources
kubectl delete namespace ventureflow

# Destroy Terraform resources (careful!)
terraform destroy
```

## Troubleshooting

### API not connecting to database
```bash
kubectl logs -n ventureflow deployment/ventureflow-api | grep -i database
kubectl exec -n ventureflow deployment/ventureflow-api -- ping postgres-service
```

### High memory usage
```bash
kubectl top nodes
kubectl top pods -n ventureflow
# Adjust resource limits in api-deployment.yaml
```

### Ingress not working
```bash
kubectl describe ingress -n ventureflow ventureflow-ingress
kubectl logs -n ingress-nginx deployment/nginx-ingress-ingress-nginx-controller
```

## Cost Optimization

1. **Use Spot Instances** for non-critical workloads
2. **Schedule scaling** - reduce nodes during off-hours
3. **RDS Savings Plans** for database
4. **Reserved Instances** for consistent workloads

## Security Checklist

- [ ] Enable EKS control plane encryption
- [ ] Enable audit logging
- [ ] Configure network policies
- [ ] Set resource quotas and limits
- [ ] Use Pod Security Policies
- [ ] Implement RBAC
- [ ] Encrypt secrets at rest
- [ ] Enable VPC Flow Logs
- [ ] Use security groups effectively
- [ ] Regular security updates

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review Kubernetes events: `kubectl describe pod <pod-name>`
3. Check metrics in Grafana
4. Review CloudTrail for AWS API issues
