# CodeQL API Client for test-reflected-xss-nodejs

This repository contains a Node.js app with an intentional XSS vulnerability and a script to retrieve CodeQL analysis results via GitHub API.

## 📋 Contents

- `index.js` - Express app with reflected XSS vulnerability
- `codeql-api.js` - Script to fetch CodeQL results from GitHub API
- `test-api.js` - Test script to verify the implementation
- `package.json` - Dependencies

## ✅ Verify the Implementation

Run the test suite to verify everything is set up correctly:

```bash
node test-api.js
```

This will test:
- ✅ All required files exist
- ✅ Package.json is configured correctly
- ✅ Vulnerable app structure is correct
- ✅ All 4 GitHub API endpoints are properly implemented
- ✅ Request headers are correct
- ✅ Error handling for invalid endpoints

**Expected output:** 9/9 tests passing

## 🧪 Test Error Handling

To verify error handling works correctly, run the API client with an invalid token:

**Windows PowerShell:**
```powershell
$env:GITHUB_TOKEN="invalid_token_test"
node codeql-api.js
```

**Linux/Mac:**
```bash
export GITHUB_TOKEN="invalid_token_test"
node codeql-api.js
```

**Expected output:** You should see:
- ❌ Error: 401
- Error message: "Bad credentials"
- Script continues and completes without crashing
- All endpoints are attempted despite errors

This demonstrates that the implementation properly handles API errors.

## 🚀 Quick Start: Testing CodeQL API

### Step 1: Get GitHub Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name it: `CodeQL API Test`
4. Select scopes:
   - ✅ `public_repo`
   - ✅ `security_events`
5. Copy the token (starts with `ghp_`)

### Step 2: Set Token & Run

**Windows PowerShell:**
```powershell
$env:GITHUB_TOKEN="ghp_your_token_here"
node codeql-api.js
```

**Linux/Mac:**
```bash
export GITHUB_TOKEN="ghp_your_token_here"
node codeql-api.js
```

### Step 3: Check Output

If CodeQL is enabled, you'll see:
- ✅ List of analyses
- ✅ Security alerts (XSS vulnerability)
- ✅ SARIF report saved to file

## 🔗 GitHub API Endpoints Used

The script calls these 4 endpoints:

1. **List analyses:**
   ```
   GET /repos/Web-Security-Repos/test-reflected-xss-nodejs/code-scanning/analyses
   ```

2. **List alerts:**
   ```
   GET /repos/Web-Security-Repos/test-reflected-xss-nodejs/code-scanning/alerts
   ```

3. **Get specific analysis:**
   ```
   GET /repos/Web-Security-Repos/test-reflected-xss-nodejs/code-scanning/analyses/{id}
   ```

4. **Get SARIF report:**
   ```
   GET /repos/Web-Security-Repos/test-reflected-xss-nodejs/code-scanning/analyses/{id}
   Header: Accept: application/sarif+json
   ```

## 📝 Using Curl (Alternative)

**List all alerts:**
```bash
curl -H "Authorization: token YOUR_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/Web-Security-Repos/test-reflected-xss-nodejs/code-scanning/alerts
```

**Get SARIF report:**
```bash
curl -H "Authorization: token YOUR_TOKEN" \
     -H "Accept: application/sarif+json" \
     https://api.github.com/repos/Web-Security-Repos/test-reflected-xss-nodejs/code-scanning/analyses/ANALYSIS_ID
```

## 🔍 About the Vulnerable App

The `index.js` file contains an intentional XSS vulnerability for testing:

```javascript
// Vulnerable code - user input directly in HTML
const q = req.query.q || '';
res.send(`<h2>Results for: ${q}</h2>`); // XSS here!
```

**To run the vulnerable app:**
```bash
npm install
node index.js
# Visit: http://localhost:3000/?q=<script>alert('XSS')</script>
```

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `GITHUB_TOKEN not set` | Set the environment variable as shown above |
| `401 Unauthorized` | Check your token has correct scopes |
| `404 Not Found` | CodeQL hasn't been run on the repo yet |
| `No analyses found` | Ask your partner to enable CodeQL |

## 📚 References

- [GitHub Code Scanning API](https://docs.github.com/rest/code-scanning)
- [About CodeQL](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
- [SARIF Format](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)

## 🎯 Expected CodeQL Findings

If CodeQL is properly configured, it should detect:
- **Vulnerability Type:** Cross-site Scripting (XSS)
- **Rule ID:** `js/reflected-xss` or similar
- **Severity:** High
- **Location:** `index.js` lines 8-27 (where user input is reflected)
- **Data Flow:** `req.query.q` → HTML output

---

**Repository:** https://github.com/Web-Security-Repos/test-reflected-xss-nodejs

