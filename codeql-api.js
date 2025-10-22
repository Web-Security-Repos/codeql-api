// codeql-api.js
// Script to retrieve CodeQL analysis results from GitHub API

const https = require('https');

const REPO_OWNER = 'Web-Security-Repos';
const REPO_NAME = 'test-reflected-xss-nodejs';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is not set.');
  console.error('Please set it with: set GITHUB_TOKEN=your_token_here (Windows)');
  console.error('Or: export GITHUB_TOKEN=your_token_here (Linux/Mac)');
  process.exit(1);
}

/**
 * Make a GET request to GitHub API
 */
function makeGitHubRequest(path, acceptHeader = 'application/vnd.github+json') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': acceptHeader,
        'User-Agent': 'CodeQL-API-Client'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = acceptHeader.includes('sarif') ? data : JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        } else {
          reject({
            statusCode: res.statusCode,
            message: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * 1. List all code scanning analyses
 */
async function listAnalyses() {
  console.log('\n📋 Listing all code scanning analyses...');
  console.log('API Endpoint: GET /repos/{owner}/{repo}/code-scanning/analyses');
  console.log(`Full URL: https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/analyses\n`);

  try {
    const result = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/analyses`);
    console.log(`✅ Status Code: ${result.statusCode}`);
    
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log(`\n📊 Found ${result.data.length} analysis/analyses:\n`);
      result.data.forEach((analysis, index) => {
        console.log(`--- Analysis ${index + 1} ---`);
        console.log(`  ID: ${analysis.id}`);
        console.log(`  Created: ${analysis.created_at}`);
        console.log(`  Tool: ${analysis.tool?.name || 'N/A'}`);
        console.log(`  Commit SHA: ${analysis.commit_sha}`);
        console.log(`  Ref: ${analysis.ref}`);
        console.log(`  Results Count: ${analysis.results_count || 0}`);
        console.log(`  Rules Count: ${analysis.rules_count || 0}`);
        console.log('');
      });
      return result.data;
    } else {
      console.log('⚠️  No analyses found. CodeQL may not have been run yet on this repository.');
      return [];
    }
  } catch (error) {
    console.error(`❌ Error: ${error.statusCode || 'Unknown'}`);
    console.error(error.message || error);
    return null;
  }
}

/**
 * 2. Get a specific analysis by ID
 */
async function getAnalysis(analysisId) {
  console.log(`\n🔍 Getting specific analysis (ID: ${analysisId})...`);
  console.log('API Endpoint: GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}');
  console.log(`Full URL: https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/analyses/${analysisId}\n`);

  try {
    const result = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/analyses/${analysisId}`);
    console.log(`✅ Status Code: ${result.statusCode}`);
    console.log('\n📄 Analysis Details:');
    console.log(JSON.stringify(result.data, null, 2));
    return result.data;
  } catch (error) {
    console.error(`❌ Error: ${error.statusCode || 'Unknown'}`);
    console.error(error.message || error);
    return null;
  }
}

/**
 * 3. Get analysis results in SARIF format
 */
async function getAnalysisSARIF(analysisId) {
  console.log(`\n📦 Getting SARIF report for analysis (ID: ${analysisId})...`);
  console.log('API Endpoint: GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}');
  console.log('Accept: application/sarif+json');
  console.log(`Full URL: https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/analyses/${analysisId}\n`);

  try {
    const result = await makeGitHubRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/analyses/${analysisId}`,
      'application/sarif+json'
    );
    console.log(`✅ Status Code: ${result.statusCode}`);
    console.log('\n📋 SARIF Report (first 1000 chars):');
    const sarifString = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2);
    console.log(sarifString.substring(0, 1000) + '...');
    
    // Save to file
    const fs = require('fs');
    const filename = `sarif-report-${analysisId}.json`;
    fs.writeFileSync(filename, sarifString);
    console.log(`\n💾 Full SARIF report saved to: ${filename}`);
    
    return result.data;
  } catch (error) {
    console.error(`❌ Error: ${error.statusCode || 'Unknown'}`);
    console.error(error.message || error);
    return null;
  }
}

/**
 * 4. List all code scanning alerts
 */
async function listAlerts() {
  console.log('\n🚨 Listing all code scanning alerts...');
  console.log('API Endpoint: GET /repos/{owner}/{repo}/code-scanning/alerts');
  console.log(`Full URL: https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/alerts\n`);

  try {
    const result = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/alerts`);
    console.log(`✅ Status Code: ${result.statusCode}`);
    
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log(`\n🔍 Found ${result.data.length} alert(s):\n`);
      result.data.forEach((alert, index) => {
        console.log(`--- Alert ${index + 1} ---`);
        console.log(`  Number: ${alert.number}`);
        console.log(`  State: ${alert.state}`);
        console.log(`  Rule ID: ${alert.rule?.id || 'N/A'}`);
        console.log(`  Rule Description: ${alert.rule?.description || 'N/A'}`);
        console.log(`  Severity: ${alert.rule?.severity || 'N/A'}`);
        console.log(`  Security Severity: ${alert.rule?.security_severity_level || 'N/A'}`);
        console.log(`  Tool: ${alert.tool?.name || 'N/A'}`);
        console.log(`  Created: ${alert.created_at}`);
        console.log(`  URL: ${alert.html_url}`);
        if (alert.most_recent_instance) {
          console.log(`  Location: ${alert.most_recent_instance.location?.path || 'N/A'}`);
          console.log(`  Lines: ${alert.most_recent_instance.location?.start_line || 'N/A'}-${alert.most_recent_instance.location?.end_line || 'N/A'}`);
        }
        console.log('');
      });
      return result.data;
    } else {
      console.log('✅ No alerts found. The repository appears to be clean!');
      return [];
    }
  } catch (error) {
    console.error(`❌ Error: ${error.statusCode || 'Unknown'}`);
    console.error(error.message || error);
    return null;
  }
}

/**
 * Main function to run all API calls
 */
async function main() {
  console.log('=================================================');
  console.log('   GitHub CodeQL API Client');
  console.log('=================================================');
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log('=================================================');

  // Step 1: List all analyses
  const analyses = await listAnalyses();

  // Step 2: List all alerts
  await listAlerts();

  // Step 3: If we have analyses, get details of the first one
  if (analyses && analyses.length > 0) {
    const firstAnalysisId = analyses[0].id;
    
    await getAnalysis(firstAnalysisId);
    await getAnalysisSARIF(firstAnalysisId);
  }

  console.log('\n=================================================');
  console.log('   API Testing Complete!');
  console.log('=================================================\n');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});


