# Security Checklist Before Deployment

## 🔒 Pre-Deployment Security Verification

Use this checklist before every deployment to ensure secrets are properly managed.

### ✅ Secret Management

- [ ] No API keys hardcoded in any source files (`.ts`, `.js`, `.tsx`, `.jsx`)
- [ ] No API keys in deployment files (`service.yaml`, `cloudbuild.yaml`, `deploy-production.sh`)
- [ ] All secrets use environment variables (`process.env.VARIABLE_NAME`)
- [ ] Production deployments use Google Cloud Secret Manager or GitHub Secrets
- [ ] `.env.local` exists locally but is NOT committed (in `.gitignore`)

### ✅ File Verification

- [ ] `service.yaml` uses template (`service.yaml.template`) or Secret Manager references
- [ ] `cloudbuild.yaml` uses `--set-secrets` flag instead of hardcoded values
- [ ] `deploy-production.sh` uses `--set-secrets` flag
- [ ] Source code files use `process.env.VARIABLE_NAME` for all API keys

### ✅ Code Review

Run these checks before committing:

```bash
# Check for hardcoded Gemini API keys
grep -r "AIzaSy" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" src/

# Check for hardcoded Azure keys
grep -r "CouXKPt\|FKp0kc" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" src/

# Check deployment files for hardcoded secrets
grep -i "api.*key.*=" service.yaml cloudbuild.yaml deploy-production.sh 2>/dev/null || echo "No secrets found in deployment files"
```

### ✅ Secret Manager Setup

For Google Cloud deployments:

- [ ] All required secrets created in Secret Manager:
  - [ ] `gemini-api-key`
  - [ ] `azure-openai-api-key`
  - [ ] `azure-dalle-api-key`
  - [ ] `azure-gpt45-api-key`
- [ ] Secret Manager API enabled in project
- [ ] Cloud Run service has permission to access secrets

### ✅ Git History

- [ ] No secrets visible in recent commits (`git log -p --all | grep -i "api.*key"`)
- [ ] If secrets were committed, they've been rotated
- [ ] Old commits with secrets are marked for future cleanup

### ✅ Documentation

- [ ] `SECURITY_GUIDE.md` is up to date
- [ ] `.env.example` includes all required variables
- [ ] Template files (`.template`) are present and don't contain secrets

## 🚨 If Secrets Are Found

If you find hardcoded secrets:

1. **STOP** - Don't commit or push
2. **Remove** the secret from the file
3. **Replace** with environment variable reference
4. **Verify** the secret is available in Secret Manager/local `.env.local`
5. **Test** that the application still works
6. **Commit** the secure version

## 📋 Quick Commands

```bash
# Verify no secrets in tracked files
git grep -i "api.*key.*=" -- ':!*.template' ':!SECURITY*' ':!*.example' ':!.gitignore'

# List all secrets in Secret Manager
gcloud secrets list --project=reeled-ai-production

# Verify Cloud Run service has access to secrets
gcloud run services describe reeled-ai --region=us-central1 --format="value(spec.template.spec.containers[0].env)"
```

