# Security Guide - Protecting API Keys and Secrets

## 🚨 CRITICAL: Never Commit Secrets to Version Control

This repository uses **GitHub Secret Scanning** which will block pushes containing hardcoded secrets. All API keys and secrets must be managed securely using the methods outlined below.

## ⚠️ Why This Matters

- **API keys in git history can be exploited** even after you remove them
- **Anyone with repository access can see secrets** in commit history
- **Public repositories expose secrets to the entire internet**
- **Compromised API keys can lead to unauthorized usage and costs**

## ✅ Secure Methods for Managing Secrets

### 1. Local Development (.env.local)

For local development, use `.env.local` file (already in `.gitignore`):

```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your actual keys (NEVER commit this file)
```

### 2. Google Cloud Secret Manager (Production)

For production deployments on Google Cloud Run, use **Secret Manager**:

#### Creating Secrets

```bash
# Create a secret for Gemini API key
echo -n "your-actual-api-key" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --project=reeled-ai-production

# Create secrets for Azure OpenAI keys
echo -n "your-azure-key" | gcloud secrets create azure-openai-api-key \
  --data-file=- \
  --project=reeled-ai-production

echo -n "your-dalle-key" | gcloud secrets create azure-dalle-api-key \
  --data-file=- \
  --project=reeled-ai-production

echo -n "your-gpt45-key" | gcloud secrets create azure-gpt45-api-key \
  --data-file=- \
  --project=reeled-ai-production
```

#### Using Secrets in Deployment

Use the `--set-secrets` flag in deployment scripts:

```bash
gcloud run deploy service-name \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest,AZURE_OPENAI_API_KEY=azure-openai-api-key:latest"
```

### 3. GitHub Secrets (CI/CD)

For GitHub Actions workflows, use **GitHub Secrets**:

1. Go to: Repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add each secret:
   - `GEMINI_API_KEY`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_DALLE_API_KEY`
   - etc.

Reference in workflows: `${{ secrets.GEMINI_API_KEY }}`

### 4. Kubernetes Secrets (if using GKE)

Use template files like `service.yaml.template` and reference secrets:

```yaml
env:
  - name: GEMINI_API_KEY
    valueFrom:
      secretKeyRef:
        name: gemini-api-key
        key: key
```

## 🔒 Files That Must NEVER Contain Secrets

These files should use templates or environment variable references:

- ❌ `service.yaml` - Use `service.yaml.template`
- ❌ `cloudbuild.yaml` - Use `cloudbuild.yaml.template` with `--set-secrets`
- ❌ `deploy-production.sh` - Use `deploy-production.sh.template`
- ❌ `.env.local` - Already in `.gitignore`
- ❌ `src/services/*.ts` - Use `process.env.VARIABLE_NAME`

## 🛠️ Migration Steps (If Secrets Were Previously Committed)

If you've already committed secrets (like we just did):

1. **Rotate all API keys immediately** in their respective consoles:
   - Google AI Studio (Gemini)
   - Azure Portal (OpenAI/DALL-E)
   - Firebase Console

2. **Remove secrets from code**:
   - Use template files (`.template` versions)
   - Replace hardcoded values with environment variables
   - Use secret management systems

3. **Clean git history** (advanced - use with caution):
   ```bash
   # Option 1: Use BFG Repo-Cleaner (recommended)
   bfg --replace-text passwords.txt
   
   # Option 2: Use git filter-branch
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/file' \
     --prune-empty --tag-name-filter cat -- --all
   ```

4. **Enable secret scanning** (already active on GitHub)

## 📋 Checklist Before Committing

- [ ] No API keys in any `.yaml`, `.sh`, `.ts`, `.js` files
- [ ] All secrets use environment variables or secret references
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] Template files (`.template`) don't contain real secrets
- [ ] Production deployment scripts use `--set-secrets` flag

## 🔍 How to Verify

Check for hardcoded secrets before pushing:

```bash
# Check for common API key patterns
grep -r "AIza" --include="*.yaml" --include="*.sh" --include="*.ts" .
grep -r "sk-" --include="*.yaml" --include="*.sh" --include="*.ts" .
grep -r "api[_-]?key" -i --include="*.yaml" --include="*.sh" --include="*.ts" .
```

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/code-security/secret-scanning)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## 🆘 If Secrets Are Compromised

1. **Immediately rotate the compromised keys**
2. **Review access logs** in the service provider's console
3. **Audit recent commits** to find when the secret was exposed
4. **Update this guide** if a new exposure vector is discovered

